# fastapi-backend/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends
from models.users import UserModel, LoginModel
from config import users_collection, households_collection
from services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(user: UserModel):
    if await users_collection.find_one({"$or": [{"email": user.email}, {"username":user.username}]}):
        raise HTTPException(400, "Email or username exists")
    doc = user.model_dump()
    doc["password"]    = hash_password(user.password)
    doc["created_at"]  = datetime.utcnow()
    result = await users_collection.insert_one(doc)
    if user.household_id:
        await households_collection.update_one(
            {"_id": user.household_id},
            {"$push": {"member_user_ids": str(result.inserted_id)}}
        )
    return {"id": str(result.inserted_id)}

@router.post("/login")
async def login(creds: LoginModel):
    rec = await users_collection.find_one({"username": creds.username})
    if not rec or not verify_password(creds.password, rec["password"]):
        raise HTTPException(400, "Invalid credentials")
    token = create_access_token(creds.username)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
async def me(user=Depends(get_current_user)):
    user.pop("password", None)
    user["id"] = str(user["_id"])  # add this
    user.pop("_id", None)          # remove raw ObjectId
    return user

