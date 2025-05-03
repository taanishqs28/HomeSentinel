# fastapi-backend/routes/logs.py
"""
This file defines API routes for logging events and retrieving system 
activity logs for the application.
"""


from fastapi import APIRouter, Depends
from config import logs_collection
from services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["logs"])

@router.get("/logs")
async def get_logs(user=Depends(get_current_user)):
    # If the user is an admin, show all logs for the household
    if user.get("role") == "admin":
        # Assuming household is defined by a common groupId / householdId
        household_id = user.get("household_id")
        all_logs = await logs_collection.find({"household_id": household_id}).to_list(length=None)
    else:
        # Regular users only see their own logs
        all_logs = await logs_collection.find({"username": user["username"]}).to_list(length=None)

    # Format logs for frontend
    return [
        {
            "timestamp": log["timestamp"].isoformat(),
            "event": log.get("status"),
            "username": log.get("username", "")
        }
        for log in all_logs
    ]
