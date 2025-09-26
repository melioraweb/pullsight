"""
File filtering utilities for PR processing.
Provides both service-oriented and legacy interfaces for backward compatibility.
"""

import os
import fnmatch
import logging
from typing import List, Set, Dict, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class FilterResult:
    """Result of file filtering operation"""
    included_files: List[str]
    excluded_files: List[str]
    total_files: int
    exclusion_reasons: Dict[str, str]  # file -> reason


class FileFilterService:
    """Service for filtering PR files based on ignore patterns and rules"""
    
    DEFAULT_IGNORED_EXTENSIONS = {
        ".lock", ".log", ".tmp", ".bak", ".iml", ".zip", ".tar", ".gz",
        ".png", ".jpg", ".jpeg", ".gif", ".pdf", ".svg", ".ico", ".mp4", ".mp3", ".json"
    }

    DEFAULT_IGNORED_FILES = {
        ".env", ".DS_Store", ".gitignore", ".gitattributes", ".gitmodules",
        "requirements.txt", "Pipfile", "Pipfile.lock", "poetry.lock", "pyproject.lock",
        "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Gemfile.lock", "Cargo.lock", "composer.lock",
        "README.md", "CHANGELOG.md", "LICENSE", "CONTRIBUTING.md"
    }

    DEFAULT_IGNORED_DIRS = {
        "node_modules", "dist", "build", "out", ".idea", ".vscode", "pycache", "site_packages"
    }
    
    def __init__(
        self, 
        ignored_extensions: Set[str] = None,
        ignored_files: Set[str] = None,
        ignored_dirs: Set[str] = None
    ):
        """
        Initialize the file filter service.
        
        Args:
            ignored_extensions: Set of file extensions to ignore
            ignored_files: Set of specific filenames to ignore
            ignored_dirs: Set of directory names to ignore
        """
        self.ignored_extensions = ignored_extensions or self.DEFAULT_IGNORED_EXTENSIONS.copy()
        self.ignored_files = ignored_files or self.DEFAULT_IGNORED_FILES.copy()
        self.ignored_dirs = ignored_dirs or self.DEFAULT_IGNORED_DIRS.copy()
    
    def filter_files(self, pr_files: List[str], custom_ignore_patterns: List[str] = None) -> FilterResult:
        """
        Filter PR files based on ignore patterns and predefined ignore rules.
        
        Args:
            pr_files: List of PR file paths to filter
            custom_ignore_patterns: Additional patterns to ignore (e.g., ["vendor/**", "dist/**"])
            
        Returns:
            FilterResult containing included and excluded files with reasons
        """
        if not pr_files:
            logger.warning("No files provided for filtering")
            return FilterResult([], [], 0, {})
        
        custom_patterns = custom_ignore_patterns or []
        
        included_files = []
        excluded_files = []
        exclusion_reasons = {}
        
        logger.info(f"Filtering {len(pr_files)} files with {len(custom_patterns)} custom patterns")
        
        for pr_file in pr_files:
            try:
                should_exclude, reason = self._should_exclude_file(pr_file, custom_patterns)
                
                if should_exclude:
                    excluded_files.append(pr_file)
                    exclusion_reasons[pr_file] = reason
                    logger.debug(f"Excluding {pr_file}: {reason}")
                else:
                    included_files.append(pr_file)
                    logger.debug(f"Including {pr_file}")
                    
            except Exception as e:
                logger.error(f"Error filtering file {pr_file}: {str(e)}")
                # Include file if filtering fails to avoid losing data
                included_files.append(pr_file)
        
        logger.info(f"Filtering complete: {len(included_files)} included, {len(excluded_files)} excluded")
        
        return FilterResult(
            included_files=included_files,
            excluded_files=excluded_files,
            total_files=len(pr_files),
            exclusion_reasons=exclusion_reasons
        )
    
    def _should_exclude_file(self, pr_file: str, custom_patterns: List[str]) -> tuple[bool, str]:
        """
        Determine if a file should be excluded and return the reason.
        
        Args:
            pr_file: File path to check
            custom_patterns: Custom ignore patterns
            
        Returns:
            Tuple of (should_exclude, reason)
        """
        try:
            # Normalize path separators to forward slashes
            normalized_file = pr_file.replace("\\", "/")
            filename = os.path.basename(normalized_file)
            ext = os.path.splitext(filename)[1].lower()
            path_parts = normalized_file.split("/")
            
            # Check predefined ignore rules
            
            # Check filename against ignored files
            if filename in self.ignored_files:
                return True, f"Filename '{filename}' in ignored files list"
            
            # Check extension against ignored extensions  
            if ext in self.ignored_extensions:
                return True, f"Extension '{ext}' in ignored extensions list"
            
            # Check if any directory part is in ignored directories
            for part in path_parts:
                if part in self.ignored_dirs:
                    return True, f"Directory '{part}' in ignored directories list"
            
            # Check against custom ignore patterns
            for pattern in custom_patterns:
                if self._matches_pattern(normalized_file, filename, pattern):
                    return True, f"Matches custom pattern '{pattern}'"
            
            return False, ""
            
        except Exception as e:
            logger.error(f"Error checking exclusion for {pr_file}: {str(e)}")
            return False, f"Error checking exclusion: {str(e)}"
    
    def _matches_pattern(self, normalized_file: str, filename: str, pattern: str) -> bool:
        """
        Check if a file matches an ignore pattern.
        
        Args:
            normalized_file: Normalized file path
            filename: Just the filename
            pattern: Pattern to match against
            
        Returns:
            True if file matches pattern
        """
        try:
            # Handle glob patterns like "vendor/**", "dist/**"
            if fnmatch.fnmatch(normalized_file, pattern):
                return True
                
            # Handle directory patterns like "tests/fixtures/**"
            if pattern.endswith("/**"):
                dir_pattern = pattern[:-3]  # Remove "/**"
                if normalized_file.startswith(dir_pattern + "/") or normalized_file == dir_pattern:
                    return True
                    
            # Handle exact file matches (full path)
            if normalized_file == pattern:
                return True
                
            # Handle filename-only matches (ignore by filename regardless of path)
            if filename == pattern:
                return True
                
            # Handle filename with extension patterns like "*.lock", "*.log"
            if pattern.startswith("*") and fnmatch.fnmatch(filename, pattern):
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error matching pattern '{pattern}': {str(e)}")
            return False

    def add_ignored_extension(self, extension: str) -> None:
        """Add an extension to the ignored extensions set"""
        if not extension.startswith('.'):
            extension = '.' + extension
        self.ignored_extensions.add(extension.lower())
        logger.debug(f"Added ignored extension: {extension}")

    def add_ignored_file(self, filename: str) -> None:
        """Add a filename to the ignored files set"""
        self.ignored_files.add(filename)
        logger.debug(f"Added ignored file: {filename}")

    def add_ignored_directory(self, dirname: str) -> None:
        """Add a directory name to the ignored directories set"""
        self.ignored_dirs.add(dirname)
        logger.debug(f"Added ignored directory: {dirname}")


# Global service instance with default settings
_filter_service = FileFilterService()

# Maintain global constants for backward compatibility
IGNORED_EXTENSIONS = FileFilterService.DEFAULT_IGNORED_EXTENSIONS
IGNORED_FILES = FileFilterService.DEFAULT_IGNORED_FILES
IGNORED_DIRS = FileFilterService.DEFAULT_IGNORED_DIRS


# Legacy functions for backward compatibility
def filter_pr_files(ignore_list: List[str], pr_files: List[str]) -> List[str]:
    """
    Legacy function - Filter PR files based on ignore patterns and predefined ignore rules.
    Use FileFilterService.filter_files() for new code.
    
    Args:
        ignore_list: List of patterns to ignore (e.g., ["vendor/**", "dist/**", "tests/fixtures/**"])
        pr_files: List of PR file paths to filter
        
    Returns:
        List of PR files that should NOT be ignored
    """
    result = _filter_service.filter_files(pr_files, ignore_list)
    return result.included_files
