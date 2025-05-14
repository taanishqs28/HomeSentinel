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
