# fastapi-backend/routes/logs.py
from fastapi import APIRouter, Depends
from config import logs_collection
from services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["logs"])

@router.get("/logs")
async def get_logs(user=Depends(get_current_user)):
    all_logs = await logs_collection.find().to_list(length=None)
    # format timestamps as ISO strings
    return [
      {
        "timestamp": log["timestamp"].isoformat(),
        "event":     log.get("status"),
        "username":  log.get("username", "")
      }
      for log in all_logs
    ]
