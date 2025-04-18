# test_mongo.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

URI = "mongodb+srv://mongoDB:<SeniorDesign>@cluster0.yftfhhu.mongodb.net/?retryWrites=true&w=majority"

async def main():
    client = AsyncIOMotorClient(URI)
    db = client["homesentinel"]
    try:
        result = await db.command("ping")
        print("✅ Mongo ping response:", result)
    except Exception as e:
        print("❌ Mongo ping failed:", e)

if __name__ == "__main__":
    asyncio.run(main())
