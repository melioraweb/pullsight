"""
Git diff formatting utilities for LLM-friendly code review.
Provides both service-oriented and legacy interfaces for backward compatibility.
"""

import re
import logging
from typing import List, Dict, Tuple, Optional, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class DiffLine:
    """Represents a single line in a diff"""
    line_num: int
    content: str
    line_type: str  # 'context', 'added', 'deleted'
    marker: str  # '  ', '+ ', '- '


@dataclass
class ParsedHunk:
    """Represents a parsed diff hunk with structured data"""
    old_start: int
    old_count: int
    new_start: int
    new_count: int
    old_lines: List[Dict[str, Any]]
    new_lines: List[Dict[str, Any]]
    context_lines: List[Dict[str, Any]]
    is_valid: bool = True
    error_message: str = ""


class DiffFormatterService:
    """Service for formatting git diffs into LLM-friendly format"""
    
    def __init__(self):
        """Initialize the diff formatter service"""
        pass
    
    def parse_diff_hunk(self, hunk: str) -> ParsedHunk:
        """
        Parse a single diff hunk to extract line numbers and content.
        
        Args:
            hunk: Raw diff hunk string
            
        Returns:
            ParsedHunk object with structured data
        """
        try:
            lines = hunk.split('\n')
            
            # Extract hunk header (e.g., "@@ -0,0 +1,923 @@")
            header_match = re.match(r'@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@', lines[0])
            if not header_match:
                return ParsedHunk(
                    0, 0, 0, 0, [], [], [],
                    is_valid=False,
                    error_message="Invalid hunk header"
                )
            
            old_start = int(header_match.group(1))
            old_count = int(header_match.group(2)) if header_match.group(2) else 0
            new_start = int(header_match.group(3))
            new_count = int(header_match.group(4)) if header_match.group(4) else 0
            
            # Process content lines
            old_line_num = old_start
            new_line_num = new_start
            old_lines = []
            new_lines = []
            context_lines = []
            
            for line in lines[1:]:
                if not line:  # Skip empty lines
                    continue
                    
                if line.startswith(' '):
                    # Context line (unchanged)
                    context_lines.append({
                        'old_line': old_line_num,
                        'new_line': new_line_num,
                        'content': line[1:],  # Remove leading space
                        'type': 'context'
                    })
                    old_line_num += 1
                    new_line_num += 1
                elif line.startswith('-'):
                    # Deleted line
                    old_lines.append({
                        'old_line': old_line_num,
                        'content': line[1:],  # Remove leading -
                        'type': 'deleted'
                    })
                    old_line_num += 1
                elif line.startswith('+'):
                    # Added line
                    new_lines.append({
                        'new_line': new_line_num,
                        'content': line[1:],  # Remove leading +
                        'type': 'added'
                    })
                    new_line_num += 1
            
            return ParsedHunk(
                old_start=old_start,
                old_count=old_count,
                new_start=new_start,
                new_count=new_count,
                old_lines=old_lines,
                new_lines=new_lines,
                context_lines=context_lines
            )
            
        except Exception as e:
            logger.error(f"Error parsing diff hunk: {str(e)}")
            return ParsedHunk(
                0, 0, 0, 0, [], [], [],
                is_valid=False,
                error_message=f"Parse error: {str(e)}"
            )
    
    def format_diff_for_llm(self, diff_hunks: List[str], file_path: str = "") -> str:
        """
        Format git diff hunks into LLM-friendly format with clear line numbers.
        
        Args:
            diff_hunks: List of raw diff hunk strings
            file_path: Path to the file being reviewed
            
        Returns:
            Formatted diff for LLM review
        """
        try:
            if not diff_hunks:
                return f"# File: {file_path}\n\nNo changes found in this file.\n"
            
            formatted_output = []
            formatted_output.append(f"# File: {file_path}")
            formatted_output.append("=" * 80)
            formatted_output.append("")
            
            for hunk_index, hunk in enumerate(diff_hunks):
                parsed = self.parse_diff_hunk(hunk)
                
                if not parsed.is_valid:
                    formatted_output.append(f"## Hunk {hunk_index + 1} - Error")
                    formatted_output.append(f"Error: {parsed.error_message}")
                    formatted_output.append("")
                    continue
                
                # Hunk header
                formatted_output.append(f"## Hunk {hunk_index + 1}")
                old_end = parsed.old_start + parsed.old_count - 1 if parsed.old_count > 0 else parsed.old_start
                new_end = parsed.new_start + parsed.new_count - 1 if parsed.new_count > 0 else parsed.new_start
                formatted_output.append(f"**Changes:** Lines {parsed.old_start}-{old_end} → {parsed.new_start}-{new_end}")
                formatted_output.append("")
                
                # Combine all lines and sort by line number
                all_lines = self._combine_and_sort_diff_lines(parsed)
                
                # Format lines
                formatted_output.append("```diff")
                for diff_line in all_lines:
                    line_num = f"{diff_line.line_num:4d}"
                    formatted_output.append(f"{line_num} {diff_line.marker}{diff_line.content}")
                
                formatted_output.append("```")
                formatted_output.append("")
                
                # Summary of changes in this hunk
                if parsed.old_lines or parsed.new_lines:
                    formatted_output.append("**Summary of changes in this hunk:**")
                    if parsed.old_lines:
                        formatted_output.append(f"- {len(parsed.old_lines)} line(s) deleted")
                    if parsed.new_lines:
                        formatted_output.append(f"- {len(parsed.new_lines)} line(s) added")
                    formatted_output.append("")
            
            return "\n".join(formatted_output)
            
        except Exception as e:
            logger.error(f"Error formatting diff for LLM: {str(e)}")
            return f"# File: {file_path}\n\nError formatting diff: {str(e)}\n"

    def format_diff_for_llm_raw_diff(self, pr_diff: str, file_path: str = "") -> str:
        """
        Format raw git diff string into LLM-friendly format with clear line numbers.
        
        Args:
            pr_diff: Raw git diff string (like prFileDiff from test.json)
            file_path: Path to the file being reviewed
            
        Returns:
            Formatted diff for LLM review
        """
        try:
            if not pr_diff or not pr_diff.strip():
                return f"# File: {file_path}\n\nNo changes found in this file.\n"
            
            # Split the raw diff into individual hunks
            diff_hunks = self._split_diff_into_hunks(pr_diff)
            
            if not diff_hunks:
                return f"# File: {file_path}\n\nNo changes found in this file.\n"
            
            formatted_output = []
            formatted_output.append(f"# File: {file_path}")
            formatted_output.append("=" * 80)
            formatted_output.append("")
            
            for hunk_index, hunk in enumerate(diff_hunks):
                parsed = self.parse_diff_hunk(hunk)
                
                if not parsed.is_valid:
                    formatted_output.append(f"## Hunk {hunk_index + 1} - Error")
                    formatted_output.append(f"Error: {parsed.error_message}")
                    formatted_output.append("")
                    continue
                
                # Hunk header
                formatted_output.append(f"## Hunk {hunk_index + 1}")
                old_end = parsed.old_start + parsed.old_count - 1 if parsed.old_count > 0 else parsed.old_start
                new_end = parsed.new_start + parsed.new_count - 1 if parsed.new_count > 0 else parsed.new_start
                formatted_output.append(f"**Changes:** Lines {parsed.old_start}-{old_end} → {parsed.new_start}-{new_end}")
                formatted_output.append("")
                
                # Combine all lines and sort by line number
                all_lines = self._combine_and_sort_diff_lines(parsed)
                
                # Format lines
                formatted_output.append("```diff")
                for diff_line in all_lines:
                    line_num = f"{diff_line.line_num:4d}"
                    formatted_output.append(f"{line_num} {diff_line.marker}{diff_line.content}")
                
                formatted_output.append("```")
                formatted_output.append("")
                
                # Summary of changes in this hunk
                if parsed.old_lines or parsed.new_lines:
                    formatted_output.append("**Summary of changes in this hunk:**")
                    if parsed.old_lines:
                        formatted_output.append(f"- {len(parsed.old_lines)} line(s) deleted")
                    if parsed.new_lines:
                        formatted_output.append(f"- {len(parsed.new_lines)} line(s) added")
                    formatted_output.append("")
            
            return "\n".join(formatted_output)
            
        except Exception as e:
            logger.error(f"Error formatting diff for LLM: {str(e)}")
            return f"# File: {file_path}\n\nError formatting diff: {str(e)}\n"
    
    def _split_diff_into_hunks(self, pr_diff: str) -> List[str]:
        """
        Split a raw git diff string into individual hunks.
        
        Args:
            pr_diff: Raw git diff string
            
        Returns:
            List of individual hunk strings
        """
        try:
            lines = pr_diff.split('\n')
            hunks = []
            current_hunk = []
            
            for line in lines:
                # Check if this line starts a new hunk
                if line.startswith('@@'):
                    # If we have a current hunk, save it
                    if current_hunk:
                        hunks.append('\n'.join(current_hunk))
                        current_hunk = []
                    # Start new hunk with the header line
                    current_hunk.append(line)
                elif current_hunk:  # We're inside a hunk
                    current_hunk.append(line)
                # Skip lines before the first hunk (like diff --git, index, ---, +++)
            
            # Don't forget the last hunk
            if current_hunk:
                hunks.append('\n'.join(current_hunk))
            
            return hunks
            
        except Exception as e:
            logger.error(f"Error splitting diff into hunks: {str(e)}")
            return []
    
    def _combine_and_sort_diff_lines(self, parsed: ParsedHunk) -> List[DiffLine]:
        """
        Combine and sort all diff lines by line number.
        
        Args:
            parsed: Parsed hunk data
            
        Returns:
            Sorted list of diff lines
        """
        all_lines = []
        
        # Add context lines
        for line in parsed.context_lines:
            all_lines.append(DiffLine(
                line_num=line['new_line'],
                content=line['content'],
                line_type='context',
                marker='  '
            ))
        
        # Add deleted lines
        for line in parsed.old_lines:
            all_lines.append(DiffLine(
                line_num=line['old_line'],
                content=line['content'],
                line_type='deleted',
                marker='- '
            ))
        
        # Add added lines
        for line in parsed.new_lines:
            all_lines.append(DiffLine(
                line_num=line['new_line'],
                content=line['content'],
                line_type='added',
                marker='+ '
            ))
        
        # Sort by line number
        all_lines.sort(key=lambda x: x.line_num)
        return all_lines
    
    def create_llm_review_context(
        self, 
        file_path: str, 
        diff_hunks: List[str], 
        file_content_before: str = ""
    ) -> str:
        """
        Create a comprehensive context for LLM review including file info, diff, and original content.
        
        Args:
            file_path: Path to the file being reviewed
            diff_hunks: List of raw diff hunk strings
            file_content_before: Original file content before changes
            
        Returns:
            Complete context for LLM review
        """
        try:
            context_parts = []
            
            # File information
            context_parts.append("# Code Review Context")
            context_parts.append(f"**File:** `{file_path}`")
            context_parts.append("")
            
            # Original file content (if provided)
            if file_content_before:
                context_parts.append("## Original File Content (Before Changes)")
                context_parts.append("```")
                context_parts.append(file_content_before)
                context_parts.append("```")
                context_parts.append("")
            
            # Formatted diff
            context_parts.append("## Changes Made (Git Diff)")
            formatted_diff = self.format_diff_for_llm(diff_hunks, file_path)
            context_parts.append(formatted_diff)
            
            # Review instructions
            context_parts.append("## Review Instructions")
            context_parts.append("Please review the changes above and provide feedback on:")
            context_parts.append("- Code quality and correctness")
            context_parts.append("- Potential bugs or issues")
            context_parts.append("- Security vulnerabilities")
            context_parts.append("- Performance implications")
            context_parts.append("- Code style and best practices")
            context_parts.append("")
            context_parts.append("For each issue found, please specify:")
            context_parts.append("- The exact line number(s) where the issue occurs")
            context_parts.append("- A clear description of the problem")
            context_parts.append("- Suggested fix or improvement")
            
            return "\n".join(context_parts)
            
        except Exception as e:
            logger.error(f"Error creating LLM review context: {str(e)}")
            return f"# Error creating review context for {file_path}\n\nError: {str(e)}"


# Global service instance
_formatter_service = DiffFormatterService()


# Legacy functions for backward compatibility
def parse_diff_hunk(hunk: str) -> Dict[str, Any]:
    """
    Legacy function - Parse a single diff hunk to extract line numbers and content.
    Use DiffFormatterService.parse_diff_hunk() for new code.
    
    Args:
        hunk: Raw diff hunk string
        
    Returns:
        Dictionary with parsed hunk data (legacy format)
    """
    parsed = _formatter_service.parse_diff_hunk(hunk)
    
    if not parsed.is_valid:
        return {"error": parsed.error_message}
    
    return {
        'old_start': parsed.old_start,
        'old_count': parsed.old_count,
        'new_start': parsed.new_start,
        'new_count': parsed.new_count,
        'old_lines': parsed.old_lines,
        'new_lines': parsed.new_lines,
        'context_lines': parsed.context_lines
    }


def format_diff_for_llm(diff_hunks: List[str], file_path: str = "") -> str:
    """
    Legacy function - Format git diff hunks into LLM-friendly format.
    Use DiffFormatterService.format_diff_for_llm() for new code.
    """
    return _formatter_service.format_diff_for_llm(diff_hunks, file_path)

def format_diff_for_llm_raw_diff(pr_diff: str, file_path: str = "") -> str:
    """
    Legacy function - Format git diff hunks into LLM-friendly format.
    Use DiffFormatterService.format_diff_for_llm() for new code.
    """
    return _formatter_service.format_diff_for_llm_raw_diff(pr_diff, file_path)


def create_llm_review_context(file_path: str, diff_hunks: List[str], file_content_before: str = "") -> str:
    """
    Legacy function - Create a comprehensive context for LLM review.
    Use DiffFormatterService.create_llm_review_context() for new code.
    """
    return _formatter_service.create_llm_review_context(file_path, diff_hunks, file_content_before)