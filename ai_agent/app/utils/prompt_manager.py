import yaml
import os
from typing import Dict, Any
from app.core.setup import setup_logger

logger = setup_logger(__name__)

# Path to the prompt configuration file
PROMPT_PATH = os.path.join(os.path.dirname(__file__), '../../config/prompt.yaml')


class PromptManager:
    """Manages prompt loading and template processing"""
    
    _cached_prompts: Dict[str, Any] = {}
    
    @classmethod
    def load_prompts(cls) -> Dict[str, Any]:
        """
        Load prompts from YAML file with caching.
        
        Returns:
            Dictionary containing all prompt templates
        """
        if not cls._cached_prompts:
            try:
                logger.info(f"Loading prompts from: {PROMPT_PATH}")
                with open(PROMPT_PATH, 'r', encoding='utf-8') as f:
                    cls._cached_prompts = yaml.safe_load(f)
                logger.info("Prompts loaded successfully")
            except FileNotFoundError:
                logger.error(f"Prompt file not found at: {PROMPT_PATH}")
                raise
            except yaml.YAMLError as e:
                logger.error(f"Error parsing YAML prompt file: {str(e)}")
                raise
            except Exception as e:
                logger.error(f"Unexpected error loading prompts: {str(e)}")
                raise
        
        return cls._cached_prompts
    
    @classmethod
    def get_prompt_template(cls, prompt_type: str) -> str:
        """
        Get a specific prompt template.
        
        Args:
            prompt_type: Type of prompt ('summary', 'review', etc.)
            
        Returns:
            Prompt template string
            
        Raises:
            KeyError: If prompt type doesn't exist
        """
        prompts = cls.load_prompts()
        if prompt_type not in prompts:
            available_types = list(prompts.keys())
            logger.error(f"Prompt type '{prompt_type}' not found. Available types: {available_types}")
            raise KeyError(f"Prompt type '{prompt_type}' not found. Available: {available_types}")
        
        return prompts[prompt_type]
    
    @staticmethod
    def fill_template(template: str, variables: Dict[str, Any]) -> str:
        """
        Fill prompt template with variables.
        
        Args:
            template: Template string with placeholders
            variables: Dictionary of variables to fill
            
        Returns:
            Filled template string
            
        Raises:
            KeyError: If required template variable is missing
            ValueError: If template formatting fails
        """
        try:
            return template.format(**variables)
        except KeyError as e:
            missing_key = str(e).strip("'")
            logger.error(f"Missing template variable: {missing_key}")
            logger.error(f"Available variables: {list(variables.keys())}")
            raise KeyError(f"Missing required template variable: {missing_key}")
        except ValueError as e:
            logger.error(f"Template formatting error: {str(e)}")
            raise ValueError(f"Template formatting failed: {str(e)}")
    
    @classmethod
    def create_filled_prompt(cls, prompt_type: str, variables: Dict[str, Any]) -> str:
        """
        Convenience method to get template and fill it in one step.
        
        Args:
            prompt_type: Type of prompt ('summary', 'review', etc.)
            variables: Dictionary of variables to fill
            
        Returns:
            Filled prompt string
        """
        template = cls.get_prompt_template(prompt_type)
        return cls.fill_template(template, variables)
    
    @classmethod
    def clear_cache(cls) -> None:
        """Clear the cached prompts (useful for testing or reload scenarios)"""
        cls._cached_prompts.clear()
        logger.info("Prompt cache cleared")