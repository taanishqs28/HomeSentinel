# fastapi-backend/config.py
from motor.motor_asyncio import AsyncIOMotorClient
from services.auth_service import hash_password, verify_password, create_access_token

MONGO_URI      = "mongodb+srv://mongoDB:SeniorDesign@cluster0.yftfhhu.mongodb.net/?retryWrites=true&w=majority"
client         = AsyncIOMotorClient(MONGO_URI)
db             = client["homesentinel"]

users_collection  = db["users"]
households_collection = db["households"]
logs_collection   = db["logs"]

