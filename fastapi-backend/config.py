from motor.motor_asyncio import AsyncIOMotorClient
from services.auth_service import hash_password, verify_password, create_access_token

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client["homesentinel"]
users_collection = db["users"]
