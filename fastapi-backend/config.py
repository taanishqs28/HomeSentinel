# fastapi-backend/config.py
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb+srv://mongoDB:MyPass1234@cluster0.yftfhhu.mongodb.net/?retryWrites=true&w=majority"
client    = AsyncIOMotorClient(MONGO_URI)
db        = client["homesentinel"]

users_collection      = db["users"]
households_collection = db["households"]
logs_collection       = db["logs"]
