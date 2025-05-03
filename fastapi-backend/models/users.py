# fastapi-backend/models/users.py
"""
This file defines Pydantic models that describe the shape and validation 
of user data, including registration details and login credentials.
"""


from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserModel(BaseModel):
    household_id: Optional[str]
    name:         str
    email:        EmailStr
    username:     str
    password:     str = Field(..., min_length=8)
    role:         str = Field("user", pattern="^(admin|user)$")
    face_embedding: List[float] = []
    created_at:   Optional[datetime]

    class Config:
        from_attributes = True  # note: pydantic v2 key

class LoginModel(BaseModel):
    username: str
    password: str = Field(..., min_length=8)

    class Config:
        from_attributes = True
class InviteRegisterModel(BaseModel):
    token: str
    name: str
    username: str
    password: str = Field(..., min_length=8)

    class Config:
        from_attributes = True
