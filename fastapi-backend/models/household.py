from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class HouseholdModel(BaseModel):
    id: Optional[str]                = None
    name: str                        = Field(..., example="The Sethi Family")
    address: Optional[str]           = Field(None, example="123 Main St")
    admin_user_id: str               = Field(..., example="604b2f2f12e4a53c4b8a2d1a")
    member_user_ids: List[str]       = []      # list of user _id’s
    created_at: Optional[datetime]   = None

    class Config:
        orm_mode = True
