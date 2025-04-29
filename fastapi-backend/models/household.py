# fastapi-backend/models/household.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class HouseholdModel(BaseModel):
    name:            str
    address:         Optional[str]
    admin_user_id:   List[str] = [] # to support multiple admins
    member_user_ids: List[str] = []
    created_at:      Optional[datetime]

    class Config:
        from_attributes = True
