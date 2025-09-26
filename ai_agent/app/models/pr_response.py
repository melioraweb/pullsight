from pydantic import BaseModel
from typing import Any

class PRSummaryResponse(BaseModel):
    prNumber: str
    pr_line: int
    pr_summary: str
    summary_usage: dict[Any, Any] = None
    model_info: str = None

class PRReviewResponse(BaseModel):
    prNumber: str
    pr_line: int
    pr_review_and_suggestion: str 
    review_usage: dict[Any, Any] = None
    model_info: str = None