from typing import Dict, Any
from app.models.pr_response import PRReviewResponse
from app.utils.prompt_manager import PromptManager
from app.core.setup import setup_logger

logger = setup_logger(__name__)


class ReviewService:
    """Service for generating PR code reviews using LLM"""
    
    def __init__(self):
        self.prompt_manager = PromptManager()
    
    async def generate_review(self, variables: Dict[str, Any], llm_service) -> PRReviewResponse:
        """
        Generate a code review for a single PR.
        
        Args:
            variables: Dictionary containing PR data and context
            llm_service: LLM service instance
            
        Returns:
            PRReviewResponse containing the generated review
        """
        try:
            logger.info(f"Generating review for PR #{variables.get('prNumber', 'unknown')}")
            
            # Create filled prompt
            prompt = self.prompt_manager.create_filled_prompt('review', variables)
            
            # Generate review using LLM
            review, review_usage, model_info = await llm_service.generate_code_review(prompt)
            
            logger.info(f"Review generated successfully. Usage: {review_usage}")
            
            return PRReviewResponse(
                prNumber=str(variables.get('prNumber', "0")), 
                pr_line=1, 
                pr_review_and_suggestion=review, 
                review_usage=review_usage, 
                model_info=model_info
            )
            
        except Exception as e:
            logger.error(f"Failed to generate review: {str(e)}")
            raise
    
    async def generate_chunked_review(self, chunk_variables: Dict[str, Any], llm_service) -> PRReviewResponse:
        """
        Generate review response for a chunk of files.
        
        Args:
            chunk_variables: Variables prepared for the chunk including file data
            llm_service: LLM service instance
        
        Returns:
            PRReviewResponse: Review response for the chunk
        """
        try:
            pr_number = chunk_variables.get('prNumber', 'unknown')
            chunk_info = chunk_variables.get('chunk_info', {})
            chunk_index = chunk_info.get('index', 'unknown')
            logger.info(f"Generating chunked review for PR #{pr_number}, chunk {chunk_index}")
            
            # Create filled prompt
            prompt = self.prompt_manager.create_filled_prompt('review', chunk_variables)
            
            # Generate review using LLM
            review, review_usage, model_info = await llm_service.generate_code_review(prompt)
            
            logger.info(f"Chunked review generated successfully. Usage: {review_usage}")
            
            return PRReviewResponse(
                prNumber=str(pr_number), 
                pr_line=1, 
                pr_review_and_suggestion=review, 
                review_usage=review_usage, 
                model_info=model_info
            )
            
        except Exception as e:
            logger.error(f"Failed to generate chunked review: {str(e)}")
            raise


# Global service instance
_review_service = ReviewService()


# Backward compatibility functions
async def generate_review_response(variables: dict, llm_service) -> PRReviewResponse:
    """
    Legacy function for backward compatibility.
    Use ReviewService.generate_review() for new code.
    """
    return await _review_service.generate_review(variables, llm_service)


async def generate_chunked_review_response(chunk_variables: dict, llm_service) -> PRReviewResponse:
    """
    Legacy function for backward compatibility.
    Use ReviewService.generate_chunked_review() for new code.
    """
    return await _review_service.generate_chunked_review(chunk_variables, llm_service) 