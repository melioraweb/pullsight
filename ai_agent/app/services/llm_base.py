from abc import ABC, abstractmethod

class BaseLLMService(ABC):
    """
    Abstract base class for LLM services used for PR summary and code review.
    Implementations should provide methods for generating PR summaries and code reviews.
    """
    @abstractmethod
    async def generate_pr_summary(self, prompt: str) -> str:
        """
        Generate a summary for a pull request based on the provided prompt.
        """
        pass

    @abstractmethod
    async def generate_code_review(self, prompt: str) -> str:
        """
        Generate a line-by-line code review for a pull request based on the provided prompt.
        """
        pass 