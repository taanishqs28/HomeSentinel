from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from config import households_collection, users_collection
from services.auth_service import get_current_user
from bson import ObjectId

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
@router.get("/me")
async def get_my_household(user=Depends(get_current_user)):
    if not user.get("household_id"):
        raise HTTPException(404, "User is not part of any household")

    household = await households_collection.find_one({"_id": ObjectId(user["household_id"])})
    if not household:
        raise HTTPException(404, "Household not found")

    household["id"] = str(household["_id"])
    household.pop("_id", None)
    return household

@router.get("/members")
async def get_household_members(user=Depends(get_current_user)):
    if not user.get("household_id"):
        raise HTTPException(404, "User is not in a household")

    members = await users_collection.find({"household_id": user["household_id"]}).to_list(None)

    for m in members:
        m["id"] = str(m["_id"])
        m.pop("_id", None)
        m.pop("password", None)
        m.pop("face_embedding", None)

    return members