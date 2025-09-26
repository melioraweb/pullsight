from pydantic import BaseModel, Field
from typing import Optional, Dict, List


class PRPayloadV2(BaseModel):
    pullRequest: dict