"""
Summary aggregation utilities for combining multiple chunk summaries.
Provides both service-oriented and legacy interfaces for backward compatibility.
"""

import logging
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class AggregationContext:
    """Context information for summary aggregation"""
    pr_metadata: Dict[str, Any]
    summary_info: Dict[str, Any]
    chunk_count: int


class SummaryAggregationService:
    """Service for aggregating multiple chunk summaries into a single comprehensive summary"""
    
    async def aggregate_summaries(
        self, 
        chunk_summaries: List[str], 
        context: AggregationContext,
        llm_service: Any
    ) -> Tuple[str, Dict[str, Any], str]:
        """
        Aggregate multiple chunk summaries into a single comprehensive summary.
        
        Args:
            chunk_summaries: List of summaries from different chunks
            context: Aggregation context with PR metadata and summary info
            llm_service: LLM service for aggregation
            
        Returns:
            Tuple of (aggregated_summary, usage_stats, model_info)
        """
        try:
            if not chunk_summaries:
                logger.warning("No chunk summaries to aggregate")
                return "", {"input_tokens": 0, "output_tokens": 0}, "claude-opus-4-1-20250805"
            
            if len(chunk_summaries) == 1:
                logger.info("Only one chunk summary, returning as-is")
                return chunk_summaries[0], {"input_tokens": 0, "output_tokens": 0}, "claude-opus-4-1-20250805"
            
            logger.info(f"Aggregating {len(chunk_summaries)} chunk summaries")
            
            # Create aggregation prompt
            aggregation_prompt = self.create_aggregation_prompt(chunk_summaries, context)
            
            # Use LLM to aggregate summaries
            aggregated_summary, summary_usage, model_info = await llm_service.generate_pr_summary(aggregation_prompt)
            logger.info("Successfully aggregated chunk summaries")
            return aggregated_summary, summary_usage, model_info
            
        except Exception as e:
            logger.error(f"Failed to aggregate summaries with LLM: {str(e)}")
            # Fallback: simple concatenation
            logger.info("Falling back to simple concatenation")
            fallback_summary = self.create_fallback_aggregation(chunk_summaries)
            return fallback_summary, {"input_tokens": 0, "output_tokens": 0}, "claude-opus-4-1-20250805"
    
    def create_aggregation_prompt(self, chunk_summaries: List[str], context: AggregationContext) -> str:
        """
        Create a prompt for aggregating multiple chunk summaries.
        
        Args:
            chunk_summaries: List of chunk summaries
            context: Aggregation context
            
        Returns:
            Aggregation prompt
        """
        try:
            prompt = f"""You are tasked with aggregating multiple summaries of a pull request into a single comprehensive summary.

Pull Request Information:
- Title: {context.pr_metadata.get('prTitle', 'N/A')}
- Number: {context.pr_metadata.get('prNumber', 'N/A')}
- Author: {context.pr_metadata.get('author_name', 'N/A')}

The PR has been analyzed in {context.chunk_count} chunks due to size constraints. Below are the summaries from each chunk:

"""
            
            for i, summary in enumerate(chunk_summaries, 1):
                prompt += f"--- Chunk {i} Summary ---\n{summary}\n\n"
            
            prompt += f"""Please create a single, comprehensive summary that:
1. Combines all the key information from all chunks
2. Maintains the same format and structure as the original summaries
3. Eliminates redundancy while preserving all important details
4. Provides a cohesive overview of the entire pull request
5. Includes the review info provided below exactly the same format and structure as the original summaries but with the total values:
{context.summary_info}

Aggregated Summary:"""
            
            return prompt
            
        except Exception as e:
            logger.error(f"Error creating aggregation prompt: {str(e)}")
            raise
    
    def create_fallback_aggregation(self, chunk_summaries: List[str]) -> str:
        """
        Fallback aggregation method when LLM aggregation fails.
        Simply concatenates summaries with clear separators.
        
        Args:
            chunk_summaries: List of chunk summaries
        
        Returns:
            Concatenated summaries
        """
        try:
            if not chunk_summaries:
                return ""
            
            if len(chunk_summaries) == 1:
                return chunk_summaries[0]
            
            # Add header and concatenate
            aggregated = f"# Aggregated Summary from {len(chunk_summaries)} Chunks\n\n"
            
            for i, summary in enumerate(chunk_summaries, 1):
                aggregated += f"## Chunk {i}\n{summary}\n\n"
            
            return aggregated.strip()
            
        except Exception as e:
            logger.error(f"Error creating fallback aggregation: {str(e)}")
            # Return empty string as ultimate fallback
            return ""


# Global service instance
_aggregation_service = SummaryAggregationService()


# Legacy functions for backward compatibility
async def aggregate_chunk_summaries(
    chunk_summaries: List[str], 
    pr_metadata: Dict, 
    llm_service: Any, 
    summary_info: Dict
) -> Tuple[str, Dict[str, Any], str]:
    """
    Legacy function - Aggregate multiple chunk summaries into a single comprehensive summary.
    Use SummaryAggregationService.aggregate_summaries() for new code.
    
    Args:
        chunk_summaries: List of summaries from different chunks
        pr_metadata: PR metadata for context
        llm_service: LLM service for aggregation
        summary_info: Review info for context
        
    Returns:
        Tuple of (aggregated_summary, usage_stats, model_info)
    """
    context = AggregationContext(
        pr_metadata=pr_metadata,
        summary_info=summary_info,
        chunk_count=len(chunk_summaries)
    )
    return await _aggregation_service.aggregate_summaries(chunk_summaries, context, llm_service)


def create_aggregation_prompt(chunk_summaries: List[str], pr_metadata: Dict, summary_info: Dict) -> str:
    """
    Legacy function - Create a prompt for aggregating multiple chunk summaries.
    Use SummaryAggregationService.create_aggregation_prompt() for new code.
    """
    context = AggregationContext(
        pr_metadata=pr_metadata,
        summary_info=summary_info,
        chunk_count=len(chunk_summaries)
    )
    return _aggregation_service.create_aggregation_prompt(chunk_summaries, context)


def fallback_aggregation(chunk_summaries: List[str]) -> str:
    """
    Legacy function - Fallback aggregation method when LLM aggregation fails.
    Use SummaryAggregationService.create_fallback_aggregation() for new code.
    """
    return _aggregation_service.create_fallback_aggregation(chunk_summaries)