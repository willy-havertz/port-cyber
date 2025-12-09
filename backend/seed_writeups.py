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
from app.core.security import get_password_hash
from datetime import datetime, timedelta

# Create engine and session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def seed_database():
    print("Starting database seeding...")
    
    # Ensure admin user exists
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        print("Creating admin user...")
        admin_password = getattr(settings, 'ADMIN_PASSWORD', 'admin123')
        admin_user = User(
            username="admin",
            email="admin@portcyber.local",
            hashed_password=get_password_hash(admin_password),
            is_admin=True,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(admin_user)
        db.commit()
        print("✅ Admin user created.")
    else:
        print("Admin user already exists.")
    
    # Check if writeups already exist - if so, skip seeding to preserve user edits
    existing_count = db.query(Writeup).count()
    if existing_count > 0:
        print(f"✅ Database already seeded with {existing_count} writeups. Skipping to preserve user edits.")
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
            "writeup_url": "/uploads/writeups/fowsniff.pdf",
            "summary": "Exploiting email enumeration and weak credentials for privilege escalation on Fowsniff machine",
            "tags": ["Linux", "Privilege Escalation", "Email Enumeration"],
        },
        {
            "title": "Lame - Classic Linux Privilege Escalation",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.EASY,
            "category": "Linux",
            "date": "2024-01-20",
            "time_spent": "1.5 hours",
            "writeup_url": "",
            "summary": "Samba vulnerability exploitation leading to root access on Lame machine",
            "tags": ["Linux", "Samba", "RCE"],
        },
        {
            "title": "Cybernetics - Advanced Web",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.MEDIUM,
            "category": "Web",
            "date": "2024-02-05",
            "time_spent": "3 hours",
            "writeup_url": "",
            "summary": "Advanced web exploitation techniques including SSRF and template injection",
            "tags": ["Web Security", "SSRF", "Template Injection"],
        },
        {
            "title": "HackPark - Windows Web Exploitation",
            "platform": Platform.TRY_HACK_ME,
            "difficulty": Difficulty.MEDIUM,
            "category": "Windows",
            "date": "2024-02-10",
            "time_spent": "2.5 hours",
            "writeup_url": "",
            "summary": "Exploiting BlogEngine vulnerability for RCE on Windows target",
            "tags": ["Windows", "Web Security", "RCE"],
        },
        {
            "title": "Advent of Cyber - Day 1",
            "platform": Platform.TRY_HACK_ME,
            "difficulty": Difficulty.EASY,
            "category": "Web",
            "date": "2024-03-01",
            "time_spent": "1 hour",
            "writeup_url": "",
            "summary": "First challenge from Advent of Cyber event covering basic web vulnerabilities",
            "tags": ["Web Security", "OWASP"],
        },
        {
            "title": "Resolute - Active Directory",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.MEDIUM,
            "category": "Active Directory",
            "date": "2024-03-15",
            "time_spent": "3.5 hours",
            "writeup_url": "",
            "summary": "Active Directory enumeration and exploitation using BloodHound and PowerView",
            "tags": ["Active Directory", "Enumeration", "Windows"],
        },
        {
            "title": "Brainfuck - Binary Exploitation",
            "platform": Platform.HACK_THE_BOX,
            "difficulty": Difficulty.HARD,
            "category": "Binary Exploitation",
            "date": "2024-04-01",
            "time_spent": "5 hours",
            "writeup_url": "",
            "summary": "Complex binary exploitation with ROP chains and heap overflow techniques",
            "tags": ["Binary Exploitation", "ROP", "Heap Overflow"],
        },
    ]
    
    print(f"Creating {len(writeups_data)} sample writeups...")
    
    # Create writeups with descending timestamps so fowsniff (first) is newest
    base_time = datetime.utcnow()
    
    for idx, data in enumerate(writeups_data):
        # Calculate creation time - each writeup is 1 day apart (descending)
        created_time = base_time - timedelta(days=idx)
        
        writeup = Writeup(
            title=data["title"],
            platform=data["platform"],
            difficulty=data["difficulty"],
            category=data["category"],
            date=data["date"],
            time_spent=data["time_spent"],
            writeup_url=data["writeup_url"],
            summary=data["summary"],
            created_at=created_time,
            updated_at=created_time,
        )
        
        # Add tags to writeup
        if "tags" in data:
            for tag_name in data["tags"]:
                # Check if tag already exists
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.flush()  # Ensure tag is persisted before associating
                writeup.tags.append(tag)
        
        db.add(writeup)
    
    db.commit()
    print(f"✅ Successfully seeded {len(writeups_data)} writeups with tags!")
    
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
