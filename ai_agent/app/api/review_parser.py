import json 
import re 
from typing import List, Dict, Optional, Any
from app.core.setup import setup_logger

logger = setup_logger(__name__)


class JSONParser:
    """Handles JSON parsing from various text formats"""
    
    @staticmethod
    def parse_json_from_text(text: str) -> List[Dict[str, Any]]:
        """
        Parse JSON array from text using multiple strategies.
        
        Args:
            text: Input text that may contain JSON
            
        Returns:
            List of dictionaries parsed from JSON, empty list if parsing fails
        """
        text = (text or "").strip()
        if not text:
            return []
        
        # Strategy 1: Parse direct JSON
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                logger.debug("Successfully parsed direct JSON")
                return parsed
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: Parse fenced JSON (```json ... ```)
        fenced_match = re.search(r"```json\s*(\[.*?\])\s*```", text, flags=re.DOTALL | re.IGNORECASE)
        if fenced_match:
            try:
                parsed = json.loads(fenced_match.group(1))
                if isinstance(parsed, list):
                    logger.debug("Successfully parsed fenced JSON")
                    return parsed
            except json.JSONDecodeError:
                pass
        
        # Strategy 3: Find first JSON array substring
        array_match = re.search(r"\[.*\]", text, flags=re.DOTALL)
        if array_match:
            try:
                parsed = json.loads(array_match.group(0))
                if isinstance(parsed, list):
                    logger.debug("Successfully parsed JSON array substring")
                    return parsed
            except json.JSONDecodeError:
                pass
        
        logger.warning("Failed to parse JSON from text")
        return []


class SeverityManager:
    """Handles severity level validation and filtering"""
    
    SEVERITY_LEVELS = ["Info", "Minor", "Major", "Critical", "Blocker"]
    SEVERITY_EMOJIS = {
        "Info": "ℹ️",
        "Minor": "⚠️", 
        "Major": "❗",
        "Critical": "🛑",
        "Blocker": "🚫"
    }
    
    @classmethod
    def validate_severity(cls, severity: str) -> str:
        """
        Validate and normalize severity level.
        
        Args:
            severity: Input severity string
            
        Returns:
            Validated severity string, defaults to "Info" if invalid
        """
        if severity in cls.SEVERITY_LEVELS:
            return severity
        
        # Try case-insensitive match
        for level in cls.SEVERITY_LEVELS:
            if severity.lower() == level.lower():
                return level
        
        logger.warning(f"Invalid severity '{severity}', defaulting to 'Info'")
        return "Info"
    
    @classmethod
    def should_include_severity(cls, item_severity: str, min_severity: str) -> bool:
        """
        Check if item severity meets minimum severity threshold.
        
        Args:
            item_severity: Severity of the review item
            min_severity: Minimum severity threshold
            
        Returns:
            True if item should be included based on severity
        """
        try:
            severity_levels_lower = [level.lower() for level in cls.SEVERITY_LEVELS]
            min_index = severity_levels_lower.index(min_severity.lower())
            item_index = severity_levels_lower.index(item_severity.lower())
            return item_index >= min_index
        except ValueError:
            logger.warning(f"Invalid severity comparison: item='{item_severity}', min='{min_severity}'")
            return True  # Include by default if comparison fails
    
    @classmethod
    def get_severity_emoji(cls, severity: str) -> str:
        """Get emoji for severity level"""
        return cls.SEVERITY_EMOJIS.get(severity, "")


class CommentFormatter:
    """Handles comment content formatting"""
    
    @staticmethod
    def format_comment_content(item: Dict[str, Any], severity: str) -> str:
        """
        Format the comment content with severity styling.
        
        Args:
            item: Review item dictionary
            severity: Validated severity level
            
        Returns:
            Formatted comment content string
        """
        # Get emoji for severity
        severity_emoji = SeverityManager.get_severity_emoji(severity)
        severity_text = f"{severity_emoji} **{severity}** " if severity_emoji else ""
        
        # Extract issue and suggestion
        issue_text = item.get("issue", "")
        suggestion_text = item.get("suggestion", "")
        
        if issue_text or suggestion_text:
            content = f"## Comment from Pullsight AI: \n\n{severity_text}\n\n\n**Issue**: {issue_text}\n\n**Suggestion**: {suggestion_text}".strip()
        else:
            # Fallback: stringify the whole item
            content = json.dumps(item, ensure_ascii=False)
            logger.warning("No issue/suggestion found in review item, using full item as content")
        
        return content
    
    @staticmethod
    def extract_line_numbers(item: Dict[str, Any]) -> tuple[int, Optional[int]]:
        """
        Extract line start and end numbers from review item.
        
        Args:
            item: Review item dictionary
            
        Returns:
            Tuple of (line_start, line_end)
        """
        line_start = int(item.get("line", item.get("lineStart", 1)) or 1)
        
        line_end = item.get("lineEnd")
        if isinstance(line_end, str):
            try:
                line_end = int(line_end)
            except ValueError:
                line_end = None
        elif not isinstance(line_end, int):
            line_end = None
        
        return line_start, line_end


class ReviewCommentBuilder:
    """Builds UI-ready comment objects from review items"""
    
    def __init__(self):
        self.json_parser = JSONParser()
        self.severity_manager = SeverityManager()
        self.comment_formatter = CommentFormatter()
    
    def build_comment(self, item: Dict[str, Any], file_name: str) -> Dict[str, Any]:
        """
        Build a single comment from review item.
        
        Args:
            item: Review item dictionary
            file_name: Target file name
            
        Returns:
            UI-ready comment dictionary
        """
        if not isinstance(item, dict):
            logger.warning("Review item is not a dictionary, skipping")
            return {}
        
        # Validate and normalize severity
        raw_severity = item.get("severity", "Info")
        severity = self.severity_manager.validate_severity(raw_severity)
        
        # Extract line numbers
        line_start, line_end = self.comment_formatter.extract_line_numbers(item)
        
        # Format content
        content = self.comment_formatter.format_comment_content(item, severity)
        
        # Build comment object
        comment = {
            "filePath": file_name,
            "lineStart": line_start,
            "lineEnd": line_end,
            "content": content,
            "codeSnippet": item.get("codeSnippet"),
            "codeSnippetLineStart": item.get("codeSnippetLineStart"),
            "severity": severity,
            "metadata": item.get("metadata", {}),
            "category": item.get("category", "Issue"),
        }
        
        return comment
    
    def build_chunked_comment(self, item: Dict[str, Any], file_mapping: Dict[str, Any], min_severity: str) -> Optional[Dict[str, Any]]:
        """
        Build a comment from review item for chunked processing.
        
        Args:
            item: Review item dictionary
            file_mapping: Mapping of file names to file info
            min_severity: Minimum severity threshold
            
        Returns:
            UI-ready comment dictionary or None if should be filtered out
        """
        if not isinstance(item, dict):
            logger.warning("Review item is not a dictionary, skipping")
            return None
        
        # Validate severity and check threshold
        raw_severity = item.get("severity", "Info")
        severity = self.severity_manager.validate_severity(raw_severity)
        
        if not self.severity_manager.should_include_severity(severity, min_severity):
            logger.debug(f"Skipping comment with severity '{severity}' (below threshold '{min_severity}')")
            return None
        
        # Validate file name
        target_file = item.get("fileName")
        if not target_file or target_file not in file_mapping:
            logger.warning(f"Invalid or missing file name '{target_file}', skipping comment")
            return None
        
        # Extract line numbers
        line_start, line_end = self.comment_formatter.extract_line_numbers(item)
        
        # Format content
        content = self.comment_formatter.format_comment_content(item, severity)
        
        # Build comment object
        comment = {
            "filePath": target_file,
            "lineStart": line_start,
            "lineEnd": line_end,
            "content": content,
            "codeSnippet": item.get("codeSnippet"),
            "codeSnippetLineStart": item.get("codeSnippetLineStart"),
            "severity": severity,
            "metadata": item.get("metadata", {}),
            "category": item.get("category", "Issue"),
        }
        
        return comment


class ReviewParser:
    """Main review parser service"""
    
    def __init__(self):
        self.json_parser = JSONParser()
        self.comment_builder = ReviewCommentBuilder()
    
    def parse_review(self, review_text: str, file_name: str) -> List[Dict[str, Any]]:
        """
        Parse LLM review output for single file to UI-ready comments.
        
        Args:
            review_text: LLM review response text
            file_name: Target file name
            
        Returns:
            List of UI-ready comment dictionaries
        """
        logger.info(f"Parsing review for file: {file_name}")
        
        # Parse JSON from text
        review_items = self.json_parser.parse_json_from_text(review_text)
        
        if not review_items:
            logger.warning("No valid review items found in response")
            return []
        
        # Build comments
        comments = []
        for item in review_items:
            comment = self.comment_builder.build_comment(item, file_name)
            if comment:  # Only add non-empty comments
                comments.append(comment)
        
        logger.info(f"Generated {len(comments)} comments for {file_name}")
        return comments
    
    def parse_chunked_review(self, review_text: str, chunk_files: List[Dict], min_severity: str) -> List[Dict[str, Any]]:
        """
        Parse LLM review output for chunk of files to UI-ready comments.
        
        Args:
            review_text: LLM review response text
            chunk_files: List of files in the chunk with their metadata
            min_severity: Minimum severity threshold
            
        Returns:
            List of UI-ready comment dictionaries
        """
        logger.info(f"Parsing chunked review for {len(chunk_files)} files, min severity: {min_severity}")
        
        # Parse JSON from text
        review_items = self.json_parser.parse_json_from_text(review_text)
        
        if not review_items:
            logger.warning("No valid review items found in chunked response")
            return []
        
        # Create file mapping for validation
        file_mapping = {file_info["prFileName"]: file_info for file_info in chunk_files}
        
        # Build comments
        comments = []
        for item in review_items:
            comment = self.comment_builder.build_chunked_comment(item, file_mapping, min_severity)
            if comment:  # Only add valid comments
                comments.append(comment)
        
        logger.info(f"Generated {len(comments)} comments from {len(review_items)} review items")
        return comments


# Global parser instance
_review_parser = ReviewParser()


# Backward compatibility functions
def parse_review_response(review_text: str, file_name: str) -> List[Dict[str, Any]]:
    """
    Legacy function for backward compatibility.
    Use ReviewParser.parse_review() for new code.
    """
    return _review_parser.parse_review(review_text, file_name)


def parse_chunked_review_response(review_text: str, chunk_files: List[Dict], minSeverity: str) -> List[Dict[str, Any]]:
    """
    Legacy function for backward compatibility.
    Use ReviewParser.parse_chunked_review() for new code.
    """
    return _review_parser.parse_chunked_review(review_text, chunk_files, minSeverity)