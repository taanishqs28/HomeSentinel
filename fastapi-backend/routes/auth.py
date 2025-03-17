from fastapi import APIRouter, HTTPException, Depends
from models.user import UserModel
from config import users_collection, hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register")
async def register(user: UserModel):
    existing_user = await users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user.password)
    new_user = {
        "username": user.username,
        "password": hashed_password,
        "face_embedding": [],
    }
    await users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user: UserModel):
    existing_user = await users_collection.find_one({"username": user.username})
    if not existing_user or not verify_password(user.password, existing_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(user.username)
    return {"access_token": access_token, "token_type": "bearer"}
