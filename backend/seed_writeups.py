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
from app.models.writeup import Writeup, Tag, Platform, Difficulty
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
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.EASY,
            "category": "Web",
            "date": "2024-01-15",
            "time_spent": "2 hours",
            "writeup_url": "/writeups/sample-sql-injection.pdf",
            "summary": "Exploiting SQL injection vulnerability in authentication system",
        },
        {
            "title": "Buffer Overflow Exploitation",
            "platform": Platform.TRY_HACK_ME,
            "difficulty": Difficulty.MEDIUM,
            "category": "Binary Exploitation",
            "date": "2024-02-10",
            "time_spent": "4 hours",
            "writeup_url": "/writeups/sample-buffer-overflow.pdf",
            "summary": "Stack-based buffer overflow leading to RCE",
        },
        {
            "title": "JWT Token Manipulation",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.EASY,
            "category": "Web",
            "date": "2024-03-05",
            "time_spent": "1.5 hours",
            "writeup_url": "/writeups/sample-jwt.pdf",
            "summary": "Manipulating JWT tokens to gain admin access",
        },
    ]
    
    print(f"Creating {len(writeups_data)} sample writeups...")
    
    for data in writeups_data:
        writeup = Writeup(
            title=data["title"],
            platform=data["platform"],
            difficulty=data["difficulty"],
            category=data["category"],
            date=data["date"],
            time_spent=data["time_spent"],
            writeup_url=data["writeup_url"],
            summary=data["summary"],
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
