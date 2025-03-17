from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId

class UserModel(BaseModel):
    id: Optional[str]  # MongoDB's `_id` field
    username: str
    password: str  # Hashed password
    face_embedding: List[float]  # Stored face encoding
    created_at: Optional[str]

    class Config:
        orm_mode = True
