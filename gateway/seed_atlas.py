import os
import math
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "modular_showcase")

DEMO_DESCRIPTIONS = [
    {
        "componentId": 1,
        "name": "Validated Email Form",
        "text": "Form validation component for reusable login signup email input validation inline errors required fields.",
    },
    {
        "componentId": 2,
        "name": "Multi Step Signup Wizard",
        "text": "Reusable onboarding wizard component for multi step forms validation progress review profile account setup.",
    },
    {
        "componentId": 3,
        "name": "Role Aware Sidebar",
        "text": "Reusable navigation component for dashboards admin panels role based access sidebar menu.",
    },
    {
        "componentId": 4,
        "name": "Breadcrumb Trail",
        "text": "Navigation breadcrumb component for nested pages hierarchy detail screens parent route exploration.",
    },
    {
        "componentId": 5,
        "name": "Revenue Metric Card",
        "text": "Reusable dashboard widget metric card analytics chart KPI revenue trend reporting.",
    },
    {
        "componentId": 6,
        "name": "Activity Timeline",
        "text": "Dashboard activity timeline component for audits approvals recent events chronological status history.",
    },
    {
        "componentId": 7,
        "name": "Data Table Toolbar",
        "text": "Reusable dashboard table toolbar with search filters export columns bulk actions data grid controls.",
    },
    {
        "componentId": 8,
        "name": "Async Toast Center",
        "text": "Feedback component for API loading success error toast notifications async operations.",
    },
    {
        "componentId": 9,
        "name": "Confirmation Modal",
        "text": "Feedback confirmation dialog modal for delete publish approvals destructive actions accessible decisions.",
    },
    {
        "componentId": 10,
        "name": "Empty State Panel",
        "text": "Feedback empty state component for no results no records recovery action helpful message.",
    },
]

def calculate_embedding(text):
    vector = [0.0] * 32
    for token in text.lower().split():
        normalized = "".join(char for char in token if char.isalnum())
        if not normalized:
            continue

        token_hash = 0
        for char in normalized:
            token_hash = (token_hash * 31 + ord(char)) % 9973
        vector[token_hash % 32] += 1

    norm = math.sqrt(sum(value * value for value in vector))
    return [value / norm for value in vector] if norm else vector

def seed():
    print("=" * 60)
    print("MongoDB Atlas Seeding Script Starting...")
    print("=" * 60)

    if not MONGO_URL or "<username>" in MONGO_URL or "<password>" in MONGO_URL or "cluster0.xxxx" in MONGO_URL:
        print("\n[WARNING] MONGO_URL placeholder detected!")
        print("Please edit the 'gateway/.env' file with your actual MongoDB Atlas connection string.")
        print("Format: MONGO_URL=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority")
        return False

    print(f"Connecting to MongoDB Atlas Database: '{MONGO_DATABASE}'...")
    try:
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command("ping")
        print("Successfully connected to MongoDB Atlas!")

        db = client[MONGO_DATABASE]

        # 1. Clear existing collections
        print("Cleaning up old collection data...")
        db.component_descriptions.delete_many({})
        db.component_embeddings.delete_many({})
        db.usage_logs.delete_many({})

        # 2. Insert descriptions
        print(f"Inserting {len(DEMO_DESCRIPTIONS)} component descriptions...")
        db.component_descriptions.insert_many(DEMO_DESCRIPTIONS)

        # 3. Generate and insert embeddings
        print("Generating and inserting vector embeddings...")
        embeddings_data = []
        for item in DEMO_DESCRIPTIONS:
            embeddings_data.append({
                "componentId": item["componentId"],
                "embedding": calculate_embedding(item["text"])
            })
        db.component_embeddings.insert_many(embeddings_data)

        # 4. Create Indexes
        print("Configuring database indexes...")
        db.component_descriptions.create_index([("componentId", 1)], unique=True)
        db.component_embeddings.create_index([("componentId", 1)], unique=True)
        db.usage_logs.create_index([("createdAt", -1)])

        print("\n[SUCCESS] Seeding completed successfully!")
        print(f"Verified component_descriptions count: {db.component_descriptions.count_documents({})}")
        print(f"Verified component_embeddings count: {db.component_embeddings.count_documents({})}")
        print("=" * 60)
        return True

    except PyMongoError as e:
        print(f"\n[ERROR] Failed to seed MongoDB Atlas: {e}")
        print("Please check your credentials, network access, or cluster configuration.")
        print("=" * 60)
        return False

if __name__ == "__main__":
    seed()
