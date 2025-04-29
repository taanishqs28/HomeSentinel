from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from config import households_collection, users_collection
from services.auth_service import get_current_user

router = APIRouter(prefix="/household", tags=["household"])

@router.post("/create")
async def create_household(data: dict, user=Depends(get_current_user)):
    if await households_collection.find_one({"name": data["name"]}):
        raise HTTPException(400, "Household name already exists")

    doc = {
        "name": data["name"],
        "address": data.get("address", ""),
        "admin_user_ids": [str(user["_id"])],
        "member_user_ids": [str(user["_id"])],
        "created_at": datetime.utcnow(),
    }

    result = await households_collection.insert_one(doc)

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"household_id": str(result.inserted_id)}}
    )

    return {"id": str(result.inserted_id), "message": "Household created successfully"}
