from anthropic import AsyncAnthropic
from config.settings import settings
from app.services.llm_base import BaseLLMService
import json
import logging

logger = logging.getLogger(__name__)

class ClaudeService(BaseLLMService):
    """
    Claude LLM service for PR summary and code review generation.
    Implements the BaseLLMService interface for easy swapping.
    """
    def __init__(self, api_key=None, model_name=None):
        self.client = AsyncAnthropic(api_key=api_key or settings.CLAUDE_API_KEY)
        self.model_name = model_name or settings.DEFAULT_MODEL

    async def generate_pr_summary(self, prompt: str) -> str:
        summary_usage = {}
        try:
            logger.info("Using model for generating summary: %s", self.model_name)    
            response = await self.client.messages.create(
                model=self.model_name,
                max_tokens=8000,
                temperature=0.5,
                system="You are a code review assistant. Summarize the pull request for a developer audience.",
                messages=[{"role": "user", "content": prompt}]
            )
            if response:
                logger.info("Claude response received for summary.")
            else:
                logger.warning("No response received from Claude for summary.")
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            summary_usage = {"input_tokens": input_tokens, "output_tokens": output_tokens}
            model_info = response.model
            text = response.content[0].text if response.content else "No summary generated."
            
            return text, summary_usage, model_info
        except Exception as e:
            print(f"Error calling Claude API for summary: {e}")
            return "Could not generate PR summary."

    async def generate_code_review(self, prompt: str) -> str:
        review_usage = {}
        try:
            logger.info("Using model for generating review: %s", self.model_name)
            response = await self.client.messages.create(
                model=self.model_name,
                max_tokens=8000,
                temperature=0.3,
                system=(
                    "You are a code review assistant. Provide actionable, line-by-line feedback on code changes. "
                    "Output must be ONLY a JSON array (no prose) with items containing: fileName,lineStart, lineEnd, issue, "
                    "codeSnippet, codeSnippetLineStart, severity, category, suggestion."
                ),
                messages=[{"role": "user", "content": prompt}],
            )
            if response:
                logger.info("Claude response received for review.")
            else:
                logger.warning("No response received from Claude for review.")
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            review_usage = {"input_tokens": input_tokens, "output_tokens": output_tokens}
            model_info = response.model

            # Concatenate all text blocks
            text = "".join(
                [getattr(b, "text", "") for b in response.content if getattr(b, "type", "") == "text"]
            ).strip()

            # Try to parse as JSON directly; if it succeeds and is a list, wrap in code fence
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    return f"```json\n{json.dumps(parsed, ensure_ascii=False)}\n```", review_usage, model_info
            except Exception:
                pass

            # If the text already contains a fenced JSON array, keep it as-is; otherwise extract the first array
            if text.startswith("```json") and text.rstrip().endswith("```"):
                return text, review_usage, model_info

            # Extract the first JSON array substring as a fallback
            import re
            match = re.search(r"\[.*\]", text, flags=re.DOTALL)
            if match:
                array_str = match.group(0)
                try:
                    json.loads(array_str)  # validate
                    return f"```json\n{array_str}\n```", review_usage, model_info
                except Exception:
                    pass

            # Last resort: return an empty JSON array in a code fence
            return "```json\n[]\n```", review_usage, model_info
        except Exception as e:
            print(f"Error calling Claude API for review: {e}")
            return "Could not perform code review."