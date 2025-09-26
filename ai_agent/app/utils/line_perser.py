"""
Text parsing utilities for extracting structured information from generated content.
Provides both service-oriented and legacy interfaces for backward compatibility.
"""

import re
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class SummaryInfo:
    """Structured information extracted from summary text"""
    estimated_code_review_time: Optional[int] = None
    potential_issue_count: Optional[int] = None
    raw_matches: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.raw_matches is None:
            self.raw_matches = {}


class TextParsingService:
    """Service for parsing text and extracting structured information"""
    
    # Default patterns for common information extraction
    DEFAULT_PATTERNS = {
        "effort_time": [
            r"⏱️\s*~\s*(\d+)\s*minutes?",
            r"estimated.*?time[:\s]*(\d+)\s*minutes?",
            r"review.*?time[:\s]*(\d+)\s*minutes?",
        ],
        "issue_count": [
            r"⚠️\s*~\s*(\d+)\s*issues?",
            r"potential.*?issues?[:\s]*(\d+)",
            r"found.*?(\d+)\s*issues?",
        ],
        "files_changed": [
            r"(\d+)\s*files?\s*changed",
            r"modified.*?(\d+)\s*files?",
        ],
        "lines_added": [
            r"\+(\d+)\s*lines?",
            r"added.*?(\d+)\s*lines?",
        ],
        "lines_removed": [
            r"-(\d+)\s*lines?",
            r"removed.*?(\d+)\s*lines?",
        ]
    }
    
    def __init__(self, custom_patterns: Dict[str, List[str]] = None):
        """
        Initialize the text parsing service.
        
        Args:
            custom_patterns: Dictionary of pattern names to regex pattern lists
        """
        self.patterns = self.DEFAULT_PATTERNS.copy()
        if custom_patterns:
            self.patterns.update(custom_patterns)
    
    def extract_summary_info(self, text: str) -> SummaryInfo:
        """
        Extract summary information from text using configured patterns.
        
        Args:
            text: Text to parse for summary information
            
        Returns:
            SummaryInfo object with extracted data
        """
        if not text:
            logger.warning("Empty text provided for summary extraction")
            return SummaryInfo()
        
        try:
            raw_matches = {}
            
            # Extract estimated code review time
            estimated_time = self._extract_first_match(text, "effort_time")
            if estimated_time is not None:
                raw_matches["effort_time"] = estimated_time
            
            # Extract potential issue count
            issue_count = self._extract_first_match(text, "issue_count")
            if issue_count is not None:
                raw_matches["issue_count"] = issue_count
            
            # Extract other metrics if available
            for key in ["files_changed", "lines_added", "lines_removed"]:
                value = self._extract_first_match(text, key)
                if value is not None:
                    raw_matches[key] = value
            
            logger.debug(f"Extracted summary info: {raw_matches}")
            
            return SummaryInfo(
                estimated_code_review_time=estimated_time,
                potential_issue_count=issue_count,
                raw_matches=raw_matches
            )
            
        except Exception as e:
            logger.error(f"Error extracting summary info: {str(e)}")
            return SummaryInfo(raw_matches={"error": str(e)})
    
    def _extract_first_match(self, text: str, pattern_key: str) -> Optional[int]:
        """
        Extract the first matching integer for a given pattern key.
        
        Args:
            text: Text to search in
            pattern_key: Key of patterns to use
            
        Returns:
            First matched integer or None
        """
        patterns = self.patterns.get(pattern_key, [])
        
        for pattern in patterns:
            try:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    return int(match.group(1))
            except (ValueError, IndexError) as e:
                logger.warning(f"Error parsing match for pattern '{pattern}': {str(e)}")
                continue
        
        return None
    
    def extract_all_matches(self, text: str, pattern_key: str) -> List[int]:
        """
        Extract all matching integers for a given pattern key.
        
        Args:
            text: Text to search in
            pattern_key: Key of patterns to use
            
        Returns:
            List of all matched integers
        """
        patterns = self.patterns.get(pattern_key, [])
        matches = []
        
        for pattern in patterns:
            try:
                found_matches = re.findall(pattern, text, re.IGNORECASE)
                for match in found_matches:
                    matches.append(int(match))
            except (ValueError, TypeError) as e:
                logger.warning(f"Error parsing matches for pattern '{pattern}': {str(e)}")
                continue
        
        return matches
    
    def add_pattern(self, pattern_key: str, patterns: List[str]) -> None:
        """
        Add custom patterns for extraction.
        
        Args:
            pattern_key: Key to identify the pattern group
            patterns: List of regex patterns
        """
        if pattern_key in self.patterns:
            self.patterns[pattern_key].extend(patterns)
        else:
            self.patterns[pattern_key] = patterns
        logger.debug(f"Added patterns for '{pattern_key}': {patterns}")
    
    def extract_custom_field(self, text: str, patterns: List[str]) -> Optional[str]:
        """
        Extract custom field using provided patterns.
        
        Args:
            text: Text to search in
            patterns: List of regex patterns to try
            
        Returns:
            First matched string or None
        """
        for pattern in patterns:
            try:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    return match.group(1)
            except (IndexError, re.error) as e:
                logger.warning(f"Error with pattern '{pattern}': {str(e)}")
                continue
        
        return None


# Global service instance
_parsing_service = TextParsingService()


# Legacy functions for backward compatibility
def extract_summary_info(text: str) -> Dict[str, Any]:
    """
    Legacy function - Extract summary information from text.
    Use TextParsingService.extract_summary_info() for new code.
    
    Args:
        text: Text to parse for summary information
        
    Returns:
        Dictionary with extracted information
    """
    info = _parsing_service.extract_summary_info(text)
    
    result = {}
    if info.estimated_code_review_time is not None:
        result["estimated_code_review_time"] = info.estimated_code_review_time
    if info.potential_issue_count is not None:
        result["potential_issue_count"] = info.potential_issue_count
    
    return result