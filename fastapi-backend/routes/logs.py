# # fastapi-backend/routes/logs.py
# """
# This file defines API routes for logging events and retrieving system 
# activity logs for the application.
# """


# from fastapi import APIRouter, Depends
# from config import logs_collection
# from services.auth_service import get_current_user

# router = APIRouter(prefix="/api", tags=["logs"])

# @router.get("/logs")
# async def get_logs(user=Depends(get_current_user)):
#     # If the user is an admin, show all logs for the household
#     if user["role"] == "admin":
#         # Assuming household is defined by a common groupId / householdId
#         household_id = user.get("household_id")
#         all_logs = await logs_collection.find({"household_id": household_id}).to_list(length=None)
#     else:
#         # Regular users only see their own logs
#         all_logs = await logs_collection.find({"username": user["username"]}).to_list(length=None)

#     # Format logs for frontend
#     return [
#         {
#             "timestamp": log["timestamp"].isoformat(),
#             "event": log.get("status"),
#             "username": log.get("username", "")
#         }
#         for log in all_logs
#     ]
# fastapi-backend/routes/logs.py

"""
This file defines API routes for logging events and retrieving system
activity logs for the application.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config import logs_collection
from services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["logs"])


class LogEntry(BaseModel):
    timestamp: str
    event:     str
    username:  str


@router.get("/logs", response_model=List[LogEntry])
async def get_logs(user=Depends(get_current_user)):
    # Make sure we know this user’s household
    if "household_id" not in user:
        raise HTTPException(400, "Missing household information")

    # Admins see everything in their household; users see only their own
    if user["role"] == "admin":
        query = {"household_id": user["household_id"]}
    else:
        query = {"username": user["username"]}

    raw_logs = await logs_collection.find(query).to_list(length=None)

    # Format each log for the frontend
    formatted = []
    for log in raw_logs:
        # Convert datetime → ISO string if needed
        ts = log["timestamp"]
        if not isinstance(ts, str):
            ts = ts.isoformat()

        formatted.append({
            "timestamp": ts,
            "event":     log.get("status", ""),
            "username":  log.get("username", "")
        })

    return formatted
