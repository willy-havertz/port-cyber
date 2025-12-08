#!/usr/bin/env python3
"""
Seed script to populate the database with sample writeups for production.
Run this once after deploying to Render.
"""
import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.writeup import Writeup, Tag
from app.models.user import User
from app.core.database import Base
from app.core.config import settings
from datetime import datetime

# Create engine and session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def seed_database():
    print("Starting database seeding...")
    
    # Check if writeups already exist
    existing_count = db.query(Writeup).count()
    if existing_count > 0:
        print(f"Database already has {existing_count} writeups. Skipping seed.")
        return
    
    # Create sample writeups
    writeups_data = [
        {
            "title": "SQL Injection in Login Portal",
            "platform": "HackTheBox",
            "difficulty": "Easy",
            "category": "Web",
            "summary": "Exploiting SQL injection vulnerability in authentication system",
            "content": "This writeup demonstrates a basic SQL injection attack on a vulnerable login portal...",
        },
        {
            "title": "Buffer Overflow Exploitation",
            "platform": "TryHackMe",
            "difficulty": "Medium",
            "category": "Binary Exploitation",
            "summary": "Stack-based buffer overflow leading to RCE",
            "content": "We discovered a buffer overflow vulnerability in a custom binary...",
        },
        {
            "title": "JWT Token Manipulation",
            "platform": "PentesterLab",
            "difficulty": "Easy",
            "category": "Web",
            "summary": "Manipulating JWT tokens to gain admin access",
            "content": "This challenge involves exploiting weak JWT implementation...",
        },
    ]
    
    print(f"Creating {len(writeups_data)} sample writeups...")
    
    for data in writeups_data:
        writeup = Writeup(
            title=data["title"],
            platform=data["platform"],
            difficulty=data["difficulty"],
            category=data["category"],
            summary=data["summary"],
            content=data["content"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(writeup)
    
    db.commit()
    print(f"✅ Successfully seeded {len(writeups_data)} writeups!")
    
    # Verify
    total = db.query(Writeup).count()
    print(f"Total writeups in database: {total}")

if __name__ == "__main__":
    try:
        seed_database()
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
