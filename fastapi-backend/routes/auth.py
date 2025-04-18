# fastapi-backend/routes/auth.py
from fastapi import APIRouter, HTTPException
from models.users import UserModel, LoginModel
from config import users_collection, households_collection
from services.auth_service import hash_password, verify_password, create_access_token
from datetime import datetime

router = APIRouter(prefix="/auth")

@router.post("/register")
async def register(user: UserModel):
    # ensure unique email/username
    if await users_collection.find_one({"$or":[{"email": user.email},{"username":user.username}]}):
        raise HTTPException(400, "Email or username already exists")

    # insert user
    user_doc = {
      "household_id":   user.household_id,
      "name":           user.name,
      "email":          user.email,
      "username":       user.username,
      "password":       hash_password(user.password),
      "face_embedding": [],
      "role":           user.role,
      "created_at":     datetime.utcnow()
    }
    result = await users_collection.insert_one(user_doc)

    # add to household if provided
    if user.household_id:
        await households_collection.update_one(
          {"_id": user.household_id},
          {"$push": {"member_user_ids": str(result.inserted_id)}}
        )

    return {"message": "User registered successfully", "id": str(result.inserted_id)}

@router.post("/login")
async def login(credentials: LoginModel):
    # look up by username
    record = await users_collection.find_one({"username": credentials.username})
    if not record or not verify_password(credentials.password, record["password"]):
        raise HTTPException(400, "Invalid credentials")

    token = create_access_token(credentials.username)
    return {"access_token": token, "token_type": "bearer"}
