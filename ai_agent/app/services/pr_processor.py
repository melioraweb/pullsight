import time
import logging
import httpx
from typing import Dict, List
from app.services.claude_service import ClaudeService
from app.api.summary import generate_summary_response
from app.api.review import generate_chunked_review_response
from app.api.review_parser import parse_chunked_review_response
from app.utils.chunking_strategy import (
    create_summary_chunks, 
    create_review_chunks, 
    prepare_chunk_for_summary, 
    prepare_chunk_for_review
)
from app.utils.summary_aggregator import aggregate_chunk_summaries
from app.utils.line_perser import extract_summary_info
from app.core.setup import setup_logger
from config.settings import Settings

logger = setup_logger(__name__)


class PRProcessor:
    """Handles the main PR processing workflow"""
    
    def __init__(self):
        Config = Settings()
        self.summary_endpoint = Config.BACKEND_SUMMARY_ENDPOINT
        self.review_endpoint = Config.BACKEND_REVIEW_ENDPOINT
    
    async def process_pr_review(self, extracted_data: Dict) -> None:
        """
        Main processing workflow for PR review.
        
        Args:
            extracted_data: Validated and extracted PR data
        """
        logger.info("*** PRProcessor.process_pr_review() CALLED ***")
        logger.info(f"*** Extracted data keys: {list(extracted_data.keys())}")
        
        start_time = time.time()
        
        logger.info("=" * 80)
        logger.info("Starting background PR review process")
        logger.info(f"PR Details: Number={extracted_data['prNumber']}, Title={extracted_data['prTitle'][:50]}...")
        logger.info(f"Configuration: Provider={extracted_data['provider']}, InstallationId={extracted_data['installation_id']}, AnalysisId={extracted_data['pullRequestAnalysisId']}")
        logger.info(f"Files to process: {extracted_data['number_of_files']}")
        
        llm_service = ClaudeService(
            api_key=extracted_data.get("api_key"), 
            model_name=extracted_data.get("model_name")
        )
        
        try:
            # Process summary
            summary_result = await self._process_summary(extracted_data, llm_service)
            await self._post_summary_to_backend(extracted_data, summary_result)
            
            # Process review
            await self._process_review(extracted_data, llm_service)
            
            total_duration = time.time() - start_time
            logger.info(f"Background PR review process completed successfully in {total_duration:.2f}s")
            
        except Exception as e:
            logger.error(f"PR processing failed: {str(e)}")
        finally:
            logger.info("=" * 80)
    
    async def _process_summary(self, extracted_data: Dict, llm_service: ClaudeService) -> Dict:
        """
        Process summary generation with chunking strategy.
        
        Args:
            extracted_data: PR data
            llm_service: LLM service instance
            
        Returns:
            Dictionary containing summary, usage info, model info, and summary info
        """
        if not extracted_data["prFiles"]:
            logger.warning("No prFiles found in payload")
            return {
                "summary": "", 
                "usage": {"input_tokens": 0, "output_tokens": 0}, 
                "model_info": "",
                "info": {"estimated_code_review_time": 0, "potential_issue_count": 0}
            }
        
        logger.info(f"Processing {len(extracted_data['prFiles'])} files for summary generation with chunking strategy")
        
        # Create chunks for summary generation
        chunks, ignored_files = create_summary_chunks(
            files=extracted_data["prFiles"],
            max_chunk_tokens=100000,  # LLM limit
            max_file_tokens=100000    # File size limit
        )
        
        if ignored_files:
            logger.warning(f"Ignored {len(ignored_files)} files for summary due to size limits")
            for ignored in ignored_files:
                logger.warning(f"  - {ignored['fileName']}: {ignored['reason']}")
        
        # Generate summaries for each chunk
        chunk_summaries = []
        total_input_tokens = 0
        total_output_tokens = 0
        total_time_estimation = 0
        total_issue_count = 0
        model_info = ""
        
        for chunk in chunks:
            logger.info(f"Generating summary for chunk {chunk['chunk_index'] + 1}/{len(chunks)} with {len(chunk['files'])} files")
            
            # Prepare chunk variables
            chunk_variables = prepare_chunk_for_summary(chunk, extracted_data)
            
            try:
                chunk_summary = await generate_summary_response(chunk_variables, llm_service)
                summary_usage = chunk_summary.summary_usage or {}
                logger.info(f"Chunk summary usage: {summary_usage}")
                model_info = chunk_summary.model_info or ""
                chunk_summaries.append(chunk_summary)
                
                summary_info = extract_summary_info(chunk_summary.pr_summary)
                logger.info(f"Summary info: {summary_info}")
                total_time_estimation += summary_info.get("estimated_code_review_time", 0)
                total_issue_count += summary_info.get("potential_issue_count", 0)
                total_input_tokens += summary_usage.get("input_tokens", 0)
                total_output_tokens += summary_usage.get("output_tokens", 0)
                logger.info(f"Successfully generated summary for chunk {chunk['chunk_index'] + 1}")
            except Exception as e:
                logger.error(f"Failed to generate summary for chunk {chunk['chunk_index'] + 1}: {str(e)}")
                # Continue with other chunks
                continue
        
        summary_info = {
            "estimated_code_review_time": total_time_estimation,
            "potential_issue_count": total_issue_count
        }
        logger.info(f"Total estimated code review time: {total_time_estimation} minutes")
        logger.info(f"Total potential issue count: {total_issue_count}")
        
        # Aggregate chunk summaries if multiple chunks
        final_summary = ""
        if len(chunk_summaries) > 1:
            logger.info(f"Aggregating {len(chunk_summaries)} chunk summaries")
            try:
                aggregated_summary, agg_usage, model_info = await aggregate_chunk_summaries(
                    chunk_summaries, extracted_data, llm_service, summary_info
                )
                summary_info = extract_summary_info(aggregated_summary)
                total_input_tokens += agg_usage.get("input_tokens", 0)
                total_output_tokens += agg_usage.get("output_tokens", 0)
                logger.info(f"Summary info: {summary_info}")
                final_summary = aggregated_summary
                logger.info("Successfully aggregated chunk summaries")
            except Exception as e:
                logger.error(f"Failed to aggregate summaries: {str(e)}")
                # Fallback to first chunk summary
                final_summary = chunk_summaries[0].pr_summary if chunk_summaries else ""
        elif len(chunk_summaries) == 1:
            final_summary = chunk_summaries[0].pr_summary
        else:
            logger.error("No summaries generated from any chunks")
            final_summary = ""
        
        logger.info(f"Summary generation completed. Processed {len(extracted_data['prFiles'])} files in {len(chunks)} chunks")
        
        return {
            "summary": final_summary,
            "usage": {"input_tokens": total_input_tokens, "output_tokens": total_output_tokens},
            "model_info": model_info,
            "info": summary_info
        }
    
    async def _post_summary_to_backend(self, extracted_data: Dict, summary_result: Dict) -> None:
        """
        Post summary to backend endpoint.
        
        Args:
            extracted_data: PR data
            summary_result: Summary processing result
        """
        logger.info("Posting summary to backend...")
        
        model_information = {"model_name": summary_result["model_info"]} if summary_result["model_info"] else {}
        
        summary_payload = {
            "pullRequestAnalysisId": extracted_data["pullRequestAnalysisId"],
            "summary": summary_result["summary"],
            "modelInfo": model_information,
            "usageInfo": summary_result["usage"],
            "summary_info": summary_result["info"]
        }

        try:
            summary_post_start = time.time()
            async with httpx.AsyncClient() as client:
                response = await client.post(self.summary_endpoint, json=summary_payload)
                summary_post_duration = time.time() - summary_post_start
                
                if response.status_code == 200:
                    logger.info(f"Summary posted to backend successfully in {summary_post_duration:.2f}s")
                else:
                    # Truncate response for cleaner logs
                    response_text = response.text[:200] + "..." if len(response.text) > 200 else response.text
                    logger.error(f"Failed to post summary. Status: {response.status_code}, Response: {response_text}")
        except Exception as e:
            logger.error(f"Exception while posting summary: {str(e)}")
    
    async def _process_review(self, extracted_data: Dict, llm_service: ClaudeService) -> None:
        """
        Process review generation with chunking strategy.
        
        Args:
            extracted_data: PR data
            llm_service: LLM service instance
        """
        if not extracted_data["prFiles"]:
            logger.warning("No prFiles found for review processing")
            return
        
        logger.info("Starting review generation process with chunking strategy...")

        # Create chunks for review generation
        review_chunks, ignored_review_files = create_review_chunks(
            files=extracted_data["prFiles"],
            max_chunk_tokens=100000,  # LLM limit for reviews
            max_file_tokens=100000    # File size limit
        )
        
        if ignored_review_files:
            logger.warning(f"Ignored {len(ignored_review_files)} files for review due to size limits")
            for ignored in ignored_review_files:
                logger.warning(f"  - {ignored['fileName']}: {ignored['reason']}")
        
        total_chunks = len(review_chunks)
        logger.info(f"Processing {extracted_data['number_of_files']} files in {total_chunks} review chunks")
        
        total_input_tokens = 0
        total_output_tokens = 0

        async with httpx.AsyncClient() as client:
            for chunk_index, chunk in enumerate(review_chunks):
                chunk_start_time = time.time()
                logger.info(f"Processing review chunk {chunk_index + 1}/{total_chunks} with {len(chunk['files'])} files")
                
                try:
                    # Prepare chunk variables for review
                    chunk_variables = prepare_chunk_for_review(chunk, extracted_data)
                    
                    logger.info(f"Generating review for chunk {chunk_index + 1} with LLM...")
                    llm_start_time = time.time()
                    review = await generate_chunked_review_response(chunk_variables, llm_service)
                    review_usage = review.review_usage or {}
                    total_input_tokens += review_usage.get("input_tokens", 0)
                    total_output_tokens += review_usage.get("output_tokens", 0)
                    logger.info(f"Review usage for chunk {chunk_index + 1}: {review_usage}")
                    model_info = review.model_info or ""
                    llm_duration = time.time() - llm_start_time
                    logger.info(f"LLM review generated for chunk {chunk_index + 1} in {llm_duration:.2f}s")
                    
                    logger.info(f"Parsing review response for chunk {chunk_index + 1}...")
                    parse_start_time = time.time()
                    chunk_comments = parse_chunked_review_response(
                        review.pr_review_and_suggestion, 
                        chunk["files"],
                        minSeverity=extracted_data["minSeverity"]
                    )
                    parse_duration = time.time() - parse_start_time
                    
                    logger.info(f"Parsed {len(chunk_comments)} comments for chunk {chunk_index + 1} in {parse_duration:.2f}s")
                    
                    chunk_duration = time.time() - chunk_start_time
                    logger.info(f"Completed processing review chunk {chunk_index + 1} in {chunk_duration:.2f}s")

                    review_usage = {
                        "input_tokens": total_input_tokens,
                        "output_tokens": total_output_tokens
                    }

                    logger.info(f"Total review usage: {review_usage}")
                    logger.info(f"Total comments generated: {len(chunk_comments)}")

                    model_information = {"model_name": model_info} if model_info else {}
                    
                    # Post this chunk's comments immediately
                    review_payload = {
                        "pullRequestAnalysisId": extracted_data["pullRequestAnalysisId"],
                        "comments": chunk_comments,
                        "modelInfo": model_information,
                        "usageInfo": review_usage,
                        "completed": 1 if chunk_index == total_chunks - 1 else 0
                    }

                    logger.info(f"Posting {len(chunk_comments)} comments for chunk {chunk_index + 1} to backend...")

                    try:
                        post_start_time = time.time()
                        response = await client.post(self.review_endpoint, json=review_payload)
                        post_duration = time.time() - post_start_time
                        
                        if response.status_code == 200:
                            logger.info(f"Review comments for chunk {chunk_index + 1} posted successfully in {post_duration:.2f}s")
                        else:
                            # Truncate response for cleaner logs
                            response_text = response.text[:200] + "..." if len(response.text) > 200 else response.text
                            logger.error(f"Failed to post review comments for chunk {chunk_index + 1}. Status: {response.status_code}, Response: {response_text}")
                    
                    except Exception as e:
                        logger.error(f"Exception while posting review comments: {str(e)}")
        
                except Exception as e:
                    logger.error(f"Failed to process review chunk {chunk_index + 1}: {str(e)}")
                    continue