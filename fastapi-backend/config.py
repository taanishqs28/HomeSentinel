# fastapi-backend/config.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
#from dotenv import load_dotenv

#load_dotenv()  # Load environment variables from .env file

#MONGO_URI = os.getenv("MONGO_URI")
MONGO_URI="mongodb+srv://mongoDB:SeniorDesign@cluster0.yftfhhu.mongodb.net/"
client    = AsyncIOMotorClient(MONGO_URI)
db        = client["homesentinel"]

users_collection      = db["users"]
households_collection = db["households"]
logs_collection       = db["logs"]
