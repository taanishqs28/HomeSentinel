"""
This file sets up the main FastAPI application, includes all API routers, 
and configures CORS middleware. It also ensures indexes on the MongoDB collections 
for users and households at app startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import users_collection, households_collection, logs_collection, invites_collection
from routes import auth, face_recognition, logs
from routes import household_route as household

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(face_recognition.router)
app.include_router(logs.router)
app.include_router(household.router)

@app.on_event("startup")
async def ensure_indexes_and_clear_dev_data():
    # Ensure indexes
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("username", unique=True)
    await households_collection.create_index("name", unique=True)

    # 🔥 TEMP: Clear all collections (development only)
    # await users_collection.delete_many({})
    # await households_collection.delete_many({})
    # await logs_collection.delete_many({})
    # await invites_collection.delete_many({})
    # print("🔥 Dev database wiped. Start clean.")
