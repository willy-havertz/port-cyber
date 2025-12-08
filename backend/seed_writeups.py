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
            "title": "Fowsniff - Linux Privilege Escalation",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.EASY,
            "category": "Linux",
            "date": "2024-01-15",
            "time_spent": "2 hours",
            "writeup_url": "/writeups/fowsniff.pdf",
            "summary": "Exploiting email enumeration and weak credentials for privilege escalation on Fowsniff machine",
        },
        {
            "title": "Lame - Classic Linux Privilege Escalation",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.EASY,
            "category": "Linux",
            "date": "2024-01-20",
            "time_spent": "1.5 hours",
            "writeup_url": "/writeups/lame.pdf",
            "summary": "Samba vulnerability exploitation leading to root access on Lame machine",
        },
        {
            "title": "Cybernetics - Advanced Web",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.MEDIUM,
            "category": "Web",
            "date": "2024-02-05",
            "time_spent": "3 hours",
            "writeup_url": "/writeups/cybernetics.pdf",
            "summary": "Advanced web exploitation techniques including SSRF and template injection",
        },
        {
            "title": "HackPark - Windows Web Exploitation",
            "platform": Platform.TRY_HACK_ME,
            "difficulty": Difficulty.MEDIUM,
            "category": "Windows",
            "date": "2024-02-10",
            "time_spent": "2.5 hours",
            "writeup_url": "/writeups/hackpark.pdf",
            "summary": "Exploiting BlogEngine vulnerability for RCE on Windows target",
        },
        {
            "title": "Advent of Cyber - Day 1",
            "platform": Platform.TRY_HACK_ME,
            "difficulty": Difficulty.EASY,
            "category": "Web",
            "date": "2024-03-01",
            "time_spent": "1 hour",
            "writeup_url": "/writeups/advent-day1.pdf",
            "summary": "First challenge from Advent of Cyber event covering basic web vulnerabilities",
        },
        {
            "title": "Resolute - Active Directory",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.MEDIUM,
            "category": "Active Directory",
            "date": "2024-03-15",
            "time_spent": "3.5 hours",
            "writeup_url": "/writeups/resolute.pdf",
            "summary": "Active Directory enumeration and exploitation using BloodHound and PowerView",
        },
        {
            "title": "Brainfuck - Binary Exploitation",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.HARD,
            "category": "Binary Exploitation",
            "date": "2024-04-01",
            "time_spent": "5 hours",
            "writeup_url": "/writeups/brainfuck.pdf",
            "summary": "Complex binary exploitation with ROP chains and heap overflow techniques",
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
