from typing import Dict, Any
from app.models.pr_response import PRSummaryResponse
from app.utils.prompt_manager import PromptManager
from app.core.setup import setup_logger

logger = setup_logger(__name__)


class SummaryService:
    """Service for generating PR summaries using LLM"""
    
    def __init__(self):
        self.prompt_manager = PromptManager()
    
    async def generate_summary(self, variables: Dict[str, Any], llm_service) -> PRSummaryResponse:
        """
        Generate a summary for a PR.
        
        Args:
            variables: Dictionary containing PR data and context
            llm_service: LLM service instance
            
        Returns:
            PRSummaryResponse containing the generated summary
        """
        try:
            logger.info(f"Generating summary for PR #{variables.get('prNumber', 'unknown')}")
            
            # Create filled prompt
            prompt = self.prompt_manager.create_filled_prompt('summary', variables)
            
            # Generate summary using LLM
            summary, summary_usage, model_info = await llm_service.generate_pr_summary(prompt)
            
            logger.info(f"Summary generated successfully. Usage: {summary_usage}")
            
            return PRSummaryResponse(
                prNumber=variables.get('prNumber', "0"), 
                pr_line=1, 
                pr_summary=summary, 
                summary_usage=summary_usage, 
                model_info=model_info
            )
            
        except Exception as e:
            logger.error(f"Failed to generate summary: {str(e)}")
            raise


# Global service instance
_summary_service = SummaryService()


# Backward compatibility function
async def generate_summary_response(variables: dict, llm_service) -> PRSummaryResponse:
    """
    Legacy function for backward compatibility.
    Use SummaryService.generate_summary() for new code.
    """
    return await _summary_service.generate_summary(variables, llm_service) 