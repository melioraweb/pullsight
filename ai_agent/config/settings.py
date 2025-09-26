import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
    BACKEND_SUMMARY_ENDPOINT = os.getenv("BACKEND_SUMMARY_ENDPOINT", "http://backend/v1/github/summary")
    BACKEND_REVIEW_ENDPOINT = os.getenv("BACKEND_REVIEW_ENDPOINT", "http://backend/v1/github/reviews")
    DEFAULT_MODEL = os.getenv("DEFAULT_MODEL_NAME", "claude-sonnet-4-20250514")


settings = Settings()
