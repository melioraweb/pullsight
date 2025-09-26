import logging
from typing import Tuple, Dict
from app.models.pr_event import PRPayloadV2
from app.utils.filter_files import filter_pr_files
from app.utils.chunking_strategy import convert_hunks_to_unified_diff
from app.core.setup import setup_logger

logger = setup_logger(__name__)


def validate_and_extract_pr_data(payload: PRPayloadV2) -> Tuple[bool, str, Dict]:
    """
    Validate PR payload and extract data in one go.
    
    Args:
        payload: PR payload from the API request
        
    Returns:
        Tuple of (is_valid, error_message, extracted_data)
        - is_valid: Boolean indicating if validation passed
        - error_message: Error message if validation failed, empty string if successful
        - extracted_data: Dictionary containing extracted and processed PR data
    """
    try:
        pr = payload.pullRequest
        if not pr:
            return False, "No pullRequest data in payload", {}
        
        # Check required fields
        required_fields = ["prNumber", "prTitle"]
        missing_fields = [field for field in required_fields if not pr.get(field)]
        if missing_fields:
            return False, f"Missing required fields: {', '.join(missing_fields)}", {}
        
        # Extract API key and model name (allow None/empty values)
        api_key = pr.get("apiKey")
        if api_key is None or api_key.strip() == "":
            api_key = None

        model_name = pr.get("modelName")
        if model_name is None or model_name.strip() == "":
            model_name = None

        # Process files
        pr_file_names = []
        ignored_files = pr.get("ignore", [])
        for file in pr.get("prFiles", []):
            pr_file_names.append(file.get("prFileName"))

        logger.info(f"Processing PR #{pr['prNumber']}: {len(pr_file_names)} files, {len(ignored_files)} ignored")
        logger.info(f"Ignored files: {ignored_files}")
        logger.info(f"PR file names: {pr_file_names}")

        # Filter allowed files
        pr_files_allowed = filter_pr_files(ignored_files, pr_file_names)
        pr_files = []
        for file in pr.get("prFiles", []):
            if file.get("prFileName") in pr_files_allowed:
                pr_files.append(file)

        # Convert hunks to unified diff
        for file in pr_files:
            # Check if prFileDiffHunks exists and is not empty
            if "prFileDiffHunks" not in file or not file.get("prFileDiffHunks"):
                continue
            file["prFileDiff"] = convert_hunks_to_unified_diff(
                file["prFileDiffHunks"], 
                file["prFileName"]
            )

        # Validate prFiles structure if present
        if pr_files and not isinstance(pr_files, list):
            return False, "prFiles must be a list", {}
        
        # Check if files have required structure
        for i, file_info in enumerate(pr_files):
            if not isinstance(file_info, dict):
                return False, f"File {i} is not a valid object", {}
            if "prFileName" not in file_info:
                return False, f"File {i} missing prFileName", {}
            if "prFileDiff" not in file_info and "prFileDiffHunks" not in file_info:
                return False, f"File {i} missing both prFileDiff and prFileDiffHunks", {}
        
        # Extract and normalize final data
        extracted_data = {
            "provider": pr.get("provider", "unknown"),
            "installation_id": pr.get("installationId", "0"),
            "pullRequestAnalysisId": pr.get("pullRequestAnalysisId", "0"),
            "number_of_files": len(pr_files),
            "prNumber": pr["prNumber"],
            "prTitle": pr["prTitle"],
            "prBody": pr.get("prBody", ""),
            "author_name": pr.get("prUser", ""),
            "repo_structure_summary": pr.get("prRepoName", ""),
            "prFiles": pr_files,
            "api_key": api_key,
            "model_name": model_name,
            "minSeverity": pr.get("minSeverity", "Major"),
            "prFileDiffHunks": pr.get("prFileDiffHunks", [])
        }
        
        logger.info(f"Validation successful: PR #{extracted_data['prNumber']}, {len(pr_files)} files")
        return True, "", extracted_data
        
    except Exception as e:
        logger.error(f"Validation failed: {str(e)}")
        return False, f"Payload validation error: {str(e)}", {}