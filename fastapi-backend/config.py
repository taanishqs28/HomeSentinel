# fastapi-backend/config.py
"""
This file handles database configuration, connecting to MongoDB, and setting 
up the main collections used in the application, like users, households, and logs.
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set.")
client    = AsyncIOMotorClient(MONGO_URI)
db        = client["homesentinel"]

users_collection      = db["users"]
households_collection = db["households"]
logs_collection       = db["logs"]
invites_collection    = db["invites"]


EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
