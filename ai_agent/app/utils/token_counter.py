"""
Token counting utilities for text processing and chunking.
Provides both service-oriented and legacy interfaces for backward compatibility.
"""

import tiktoken
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TokenCountResult:
    """Result of token counting operation"""
    count: int
    model: str
    encoding_used: str
    fallback_used: bool = False


class TokenCountingService:
    """Service for counting tokens in text strings using tiktoken"""
    
    def __init__(self, default_model: str = "claude-3-sonnet-20240229", encoding: str = "cl100k_base"):
        """
        Initialize the token counting service.
        
        Args:
            default_model: Default model name for token counting
            encoding: Encoding to use (cl100k_base is compatible with Claude models)
        """
        self.default_model = default_model
        self.encoding_name = encoding
        self._encoding = None
        self._load_encoding()
    
    def _load_encoding(self) -> None:
        """Load the tiktoken encoding"""
        try:
            self._encoding = tiktoken.get_encoding(self.encoding_name)
            logger.debug(f"Loaded encoding: {self.encoding_name}")
        except Exception as e:
            logger.error(f"Failed to load encoding {self.encoding_name}: {str(e)}")
            self._encoding = None
    
    def count_tokens(self, text: str, model: Optional[str] = None) -> TokenCountResult:
        """
        Count the number of tokens in a text string.
        
        Args:
            text: The text to count tokens for
            model: The model name to use for tokenization
        
        Returns:
            TokenCountResult with count and metadata
        """
        if not text:
            return TokenCountResult(
                count=0,
                model=model or self.default_model,
                encoding_used=self.encoding_name
            )
        
        try:
            if self._encoding is None:
                # Try to reload encoding
                self._load_encoding()
            
            if self._encoding is not None:
                tokens = self._encoding.encode(text)
                return TokenCountResult(
                    count=len(tokens),
                    model=model or self.default_model,
                    encoding_used=self.encoding_name
                )
            else:
                # Fallback to character-based estimation
                return self._fallback_count(text, model)
        
        except Exception as e:
            logger.error(f"Error counting tokens: {str(e)}")
            return self._fallback_count(text, model)
    
    def _fallback_count(self, text: str, model: Optional[str]) -> TokenCountResult:
        """
        Fallback token counting using character-based estimation.
        
        Args:
            text: Text to count
            model: Model name
        
        Returns:
            TokenCountResult with fallback estimation
        """
        # Rough estimation: 1 token ≈ 4 characters for English text
        estimated_count = len(text) // 4
        logger.warning(f"Using fallback token estimation: {estimated_count} tokens")
        
        return TokenCountResult(
            count=estimated_count,
            model=model or self.default_model,
            encoding_used="fallback_char_estimation",
            fallback_used=True
        )
    
    def estimate_tokens_for_file(self, file_content: str, model: Optional[str] = None) -> int:
        """
        Estimate the number of tokens for file content.
        
        Args:
            file_content: The file content
            model: Model name for tokenization
        
        Returns:
            Estimated token count
        """
        result = self.count_tokens(file_content, model)
        return result.count
    
    def is_content_too_large(self, content: str, max_tokens: int = 100000, model: Optional[str] = None) -> bool:
        """
        Check if content exceeds maximum token limit.
        
        Args:
            content: Content to check
            max_tokens: Maximum allowed tokens
            model: Model name for tokenization
        
        Returns:
            True if content is too large, False otherwise
        """
        try:
            token_count = self.estimate_tokens_for_file(content, model)
            return token_count >= max_tokens
        except Exception as e:
            logger.error(f"Error checking content size: {str(e)}")
            # Err on the side of caution
            return len(content) > max_tokens * 4  # Fallback character check


# Global service instance
_token_service = TokenCountingService()


# Legacy functions for backward compatibility
def count_tokens(text: str, model: str = "claude-3-sonnet-20240229") -> int:
    """
    Legacy function - Count the number of tokens in a text string.
    Use TokenCountingService.count_tokens() for new code.
    
    Args:
        text: The text to count tokens for
        model: The model name to use for tokenization
    
    Returns:
        The number of tokens
    """
    result = _token_service.count_tokens(text, model)
    return result.count


def estimate_tokens(text: str) -> int:
    """
    Legacy function - Estimate tokens in text.
    Use TokenCountingService.estimate_tokens_for_file() for new code.
    """
    return _token_service.estimate_tokens_for_file(text)


def estimate_tokens_for_file(file_diff: str) -> int:
    """
    Legacy function - Estimate the number of tokens for a file diff.
    Use TokenCountingService.estimate_tokens_for_file() for new code.
    
    Args:
        file_diff: The file diff content
    
    Returns:
        Estimated token count
    """
    return _token_service.estimate_tokens_for_file(file_diff)


def is_file_too_large(file_diff: str, max_tokens: int = 100000) -> bool:
    """
    Legacy function - Check if a file diff is too large (exceeds max_tokens).
    Use TokenCountingService.is_content_too_large() for new code.
    
    Args:
        file_diff: The file diff content
        max_tokens: Maximum allowed tokens
    
    Returns:
        True if file is too large, False otherwise
    """
    return _token_service.is_content_too_large(file_diff, max_tokens)