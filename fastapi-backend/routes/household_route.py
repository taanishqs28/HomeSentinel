"""
This file defines API routes for managing households, including creating 
households, listing members, inviting users, promoting members to admin, 
and removing members.
"""


from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from config import households_collection, users_collection
from services.auth_service import get_current_user
from services.email_utils import send_invite_email
from bson import ObjectId
from config import invites_collection  
import uuid

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

@router.post("/promote")
async def promote_to_admin(data: dict, user=Depends(get_current_user)):
    from bson import ObjectId

    target_id = data.get("user_id")
    if not target_id:
        raise HTTPException(400, "Missing user_id")

    household = await households_collection.find_one({"_id": ObjectId(user["household_id"])})
    if not household or str(user["_id"]) not in household["admin_user_ids"]:
        raise HTTPException(403, "Only admins can promote")

    target_user = await users_collection.find_one({"_id": ObjectId(target_id)})
    if not target_user or target_user.get("household_id") != user["household_id"]:
        raise HTTPException(404, "Target user not found or not in household")

    if target_user["role"] == "admin":
        return {"message": "User is already an admin"}

    # Promote
    await users_collection.update_one({"_id": ObjectId(target_id)}, {"$set": {"role": "admin"}})
    await households_collection.update_one(
        {"_id": ObjectId(user["household_id"])},
        {"$addToSet": {"admin_user_ids": str(target_user["_id"])}}
    )

    return {"message": "User promoted to admin"}

@router.post("/remove-member")
async def remove_member(data: dict, user=Depends(get_current_user)):
    from bson import ObjectId

    target_id = data.get("user_id")
    if str(user["_id"]) == target_id:
        raise HTTPException(400, "You cannot remove yourself")
    if not target_id:
        raise HTTPException(400, "Missing user_id")

    if str(user["_id"]) == target_id:
        raise HTTPException(400, "You cannot remove yourself")

    household = await households_collection.find_one({"_id": ObjectId(user["household_id"])})
    if not household or str(user["_id"]) not in household["admin_user_ids"]:
        raise HTTPException(403, "Only admins can remove members")

    target_user = await users_collection.find_one({"_id": ObjectId(target_id)})
    if not target_user or target_user.get("household_id") != user["household_id"]:
        raise HTTPException(404, "User not found in household")

    # Remove role and household_id
    await users_collection.update_one(
        {"_id": ObjectId(target_id)},
        {"$set": {"household_id": None, "role": "user"}}
    )

    await households_collection.update_one(
        {"_id": ObjectId(user["household_id"])},
        {
            "$pull": {
                "member_user_ids": target_id,
                "admin_user_ids": target_id,
            }
        }
    )

    return {"message": "User removed from household"}

# Demote Admin to User:
@router.post("/demote")
async def remove_admin(data: dict, user=Depends(get_current_user)):
    target_id = data.get("user_id")
    if str(user["_id"]) == target_id:
        raise HTTPException(400, "You cannot demote yourself")
    if not target_id:
        raise HTTPException(400, "Missing user_id")

    household = await households_collection.find_one({"_id": ObjectId(user["household_id"])})
    if not household or str(user["_id"]) not in household["admin_user_ids"]:
        raise HTTPException(403, "Only admins can demote other admins")

    target_user = await users_collection.find_one({"_id": ObjectId(target_id)})
    if not target_user or target_user.get("household_id") != user["household_id"]:
        raise HTTPException(404, "User not found or not in household")

    if target_user["role"] != "admin":
        return {"message": "User is not an admin"}

    await users_collection.update_one({"_id": ObjectId(target_id)}, {"$set": {"role": "user"}})
    await households_collection.update_one(
        {"_id": ObjectId(user["household_id"])},
        {"$pull": {"admin_user_ids": target_id}}
    )

    return {"message": "User demoted to user role"}


@router.post("/invite")
async def invite_user(data: dict, user=Depends(get_current_user)):
    if not user.get("household_id"):
        raise HTTPException(400, "You are not part of a household")

    household = await households_collection.find_one({"_id": ObjectId(user["household_id"])})
    if not household or str(user["_id"]) not in household.get("admin_user_ids", []):
        raise HTTPException(403, "Only admins can invite users")

    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        raise HTTPException(400, "Name and email are required")

    # Check for existing invite
    existing = await invites_collection.find_one({
        "email": email,
        "household_id": user["household_id"],
        "used": False
    })
    if existing:
        raise HTTPException(400, "This person has already been invited.")

    token = str(uuid.uuid4())

    invite_doc = {
        "name": name,
        "email": email,
        "token": token,
        "household_id": user["household_id"],
        "inviter_id": str(user["_id"]),
        "used": False,
        "created_at": datetime.utcnow()
    }

    await invites_collection.insert_one(invite_doc)
    invite_url = f"http://localhost:3000/register-invite/{token}"
    try:
        send_invite_email(email, name, invite_url)
    except Exception as e:
        print("Warning: invite email failed:", str(e))

    return {
        "message": "Invite created successfully.",
        "invite_token": token,
        "invite_url": invite_url
    }
@router.get("/invite/{token}")
async def get_invite_details(token: str):
    invite = await invites_collection.find_one({"token": token, "used": False})
    if not invite:
        raise HTTPException(404, "Invite not found or expired")

    # Check if invite is older than 4 days
    expiration_days = 4
    if (datetime.utcnow() - invite["created_at"]).days > expiration_days:
        raise HTTPException(400, "Invite has expired")

    return {
        "name": invite["name"],
        "email": invite["email"],
        "household_id": invite["household_id"]
    }