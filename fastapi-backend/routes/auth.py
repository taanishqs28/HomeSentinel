# fastapi-backend/routes/auth.py
"""
This file defines authentication API routes, including user registration, 
login, and retrieving the current user's profile.
"""

from fastapi import APIRouter, HTTPException, Depends
from models.users import UserModel, LoginModel, InviteRegisterModel
from config import users_collection, households_collection, invites_collection
from bson import ObjectId
from services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(user: UserModel):
    if await users_collection.find_one({"$or": [{"email": user.email}, {"username":user.username}]}):
        raise HTTPException(400, "Email or username exists")
    # Generate a random 6-8 digit PIN as a string
    failsafe_pin = str(random.randint(10**5, 10**8 - 1))
    doc = user.model_dump()
    doc["username"]    = doc["username"].lower()
    doc["password"]    = hash_password(user.password)
    doc["created_at"]  = datetime.utcnow()
    doc["failsafe_pin"] = failsafe_pin
    result = await users_collection.insert_one(doc)
    if user.household_id:
        await households_collection.update_one(
            {"_id": user.household_id},
            {"$push": {"member_user_ids": str(result.inserted_id)}}
        )
    return {"id": str(result.inserted_id), "failsafe_pin": failsafe_pin}

@router.post("/login")
async def login(creds: LoginModel):
    rec = await users_collection.find_one({"username": {"$regex": f"^{creds.username}$", "$options": "i"}})
    if not rec or not verify_password(creds.password, rec["password"]):
        raise HTTPException(400, "Invalid credentials")
    token = create_access_token(creds.username)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
async def me(user=Depends(get_current_user)):
    user.pop("password", None)
    user["id"] = str(user["_id"])
    user["current_user_id"] = str(user["_id"])      # add this line
    user["current_user_email"] = user["email"]      # add this line
    user.pop("_id", None)
    return user

@router.post("/invite-register")
async def invite_register(data: InviteRegisterModel):
    invite = await invites_collection.find_one({"token": data.token, "used": False})
    if not invite:
        raise HTTPException(400, "Invalid or expired invite")

    # Check if username is taken
    if await users_collection.find_one({"username": data.username}):
        raise HTTPException(400, "Username already exists")

    hashed_password = hash_password(data.password)
    new_user = {
        "name": data.name,
        "username": data.username.lower(),
        "email": invite["email"],
        "password": hashed_password,
        "household_id": invite["household_id"],
        "role": "user",
        "face_embedding": [],
        "created_at": datetime.utcnow()
    }

    result = await users_collection.insert_one(new_user)

    # Update household
    await households_collection.update_one(
        {"_id": ObjectId(invite["household_id"])},
        {"$push": {"member_user_ids": str(result.inserted_id)}}
    )

    # Mark invite as used
    await invites_collection.update_one(
        {"_id": invite["_id"]},
        {"$set": {"used": True}}
    )

    return {"id": str(result.inserted_id), "message": "Registration successful"}
