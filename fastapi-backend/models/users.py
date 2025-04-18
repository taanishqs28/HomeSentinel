from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserModel(BaseModel):
    id: Optional[str]                  = None                           # MongoDB’s _id
    household_id: Optional[str]       = None                           # Link to a household
    name: str                          = Field(..., example="Jane Doe")
    email: EmailStr                    = Field(..., example="jane@example.com")
    username: str                      = Field(..., example="janedoe")
    password: str                      = Field(..., min_length=8)
    face_embedding: List[float]        = []                             # 128‑dim face vector
    role: str                          = Field(
                                        "user",
                                        pattern="^(admin|user)$",
                                        description="must be 'admin' or 'user'"
                                      )
    created_at: Optional[datetime]     = None

    class Config:
        orm_mode = True

class LoginModel(BaseModel):
    username: str = Field(..., example="janedoe")
    password: str = Field(..., min_length=8)

    class Config:
        orm_mode = True
