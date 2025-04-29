# fastapi-backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import users_collection, households_collection
from routes import auth, face_recognition, logs


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(face_recognition.router)
app.include_router(logs.router)

@app.on_event("startup")
async def ensure_indexes():
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("username", unique=True)
    await households_collection.create_index("name", unique=True)
