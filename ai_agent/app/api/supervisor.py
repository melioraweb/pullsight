from fastapi import APIRouter, BackgroundTasks
from app.models.pr_event import PRPayloadV2
from app.services.validation import validate_and_extract_pr_data
from app.services.pr_processor import PRProcessor
from app.core.setup import setup_logger

# Setup logger
logger = setup_logger(__name__)

supervisor = APIRouter(prefix="", tags=["Supervisor"])

# Initialize processor
pr_processor = PRProcessor()

async def process_pr_background(extracted_data: dict):
    """Background task wrapper for PR processing"""
    try:
        logger.info("=== STARTING BACKGROUND TASK ===")
        logger.info(f"Background task started for PR #{extracted_data.get('prNumber', 'unknown')}")
        await pr_processor.process_pr_review(extracted_data)
        logger.info("=== BACKGROUND TASK COMPLETED ===")
    except Exception as e:
        logger.error(f"=== BACKGROUND TASK FAILED ===")
        logger.error(f"Background task error: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")


    

@supervisor.post("/ai_agent")
async def supervisor_pr_review(payload: PRPayloadV2, background_tasks: BackgroundTasks):
    """
    AI Agent endpoint for PR review processing.
    Validates input, responds immediately, then processes in background.
    """
    logger.info("Received PR review request")
    
    # Validate and extract data using the new validation service
    is_valid, error_message, extracted_data = validate_and_extract_pr_data(payload)
    
    if not is_valid:
        logger.error(f"Validation failed: {error_message}")
        return {
            "status": "error", 
            "message": f"Invalid payload: {error_message}"
        }
    
    # Schedule background processing using the new processor
    logger.info(f"Scheduling background processing for PR #{extracted_data['prNumber']}")
    background_tasks.add_task(process_pr_background, extracted_data)
    
    # Return immediate response
    logger.info("Sending immediate response: Data received, review in progress")
    return {
        "status": "accepted",
        "message": "Data received, review in progress",
        "pullRequestAnalysisId": extracted_data["pullRequestAnalysisId"],
        "prNumber": extracted_data["prNumber"],
        "filesCount": extracted_data["number_of_files"]
    }
