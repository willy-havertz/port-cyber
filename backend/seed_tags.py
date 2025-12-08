#!/usr/bin/env python3
"""
Script to seed tags for writeups
"""
import sys
import os
sys.path.insert(0, '/home/wiltord/Desktop/playground/port-cyber/backend')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.writeup import Writeup, Tag

# Direct database connection
DATABASE_URL = "postgresql://portcyber:portcyber123@localhost:5432/portcyber"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Tag mappings for each writeup
WRITEUP_TAGS = {
    1: ["port scanning", "email service exploitation", "password cracking", "privilege escalation"],  # Fowsniff
    2: ["linux", "samba", "exploit", "privesc"],  # Lame
    3: ["web", "sql-injection", "xxe", "deserialization"],  # Cybernetics
    4: ["windows", "web", "upload-vuln", "privesc"],  # HackPark
    5: ["web", "xss", "command-injection", "advent-of-cyber"],  # Advent Day 1
    6: ["active directory", "kerberos", "bloodhound", "lateral movement"],  # Resolute
    7: ["binary", "pwn", "buffer-overflow", "rop"],  # Brainfuck
}

def main():
    db = SessionLocal()
    
    try:
        # Create or get tags
        tag_objects = {}
        for writeup_id, tag_names in WRITEUP_TAGS.items():
            for tag_name in tag_names:
                if tag_name not in tag_objects:
                    # Check if tag exists
                    existing_tag = db.query(Tag).filter(Tag.name == tag_name).first()
                    if existing_tag:
                        tag_objects[tag_name] = existing_tag
                    else:
                        tag = Tag(name=tag_name)
                        db.add(tag)
                        db.flush()
                        tag_objects[tag_name] = tag
        
        # Commit tags
        db.commit()
        
        # Associate tags with writeups
        for writeup_id, tag_names in WRITEUP_TAGS.items():
            writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
            if writeup:
                for tag_name in tag_names:
                    if tag_name in tag_objects:
                        if tag_objects[tag_name] not in writeup.tags:
                            writeup.tags.append(tag_objects[tag_name])
        
        db.commit()
        print("✓ Tags seeded successfully")
        
        # Verify
        for writeup_id in WRITEUP_TAGS.keys():
            writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
            if writeup:
                tag_names = [tag.name for tag in writeup.tags]
                print(f"  Writeup {writeup_id}: {', '.join(tag_names)}")
    
    except Exception as e:
        print(f"✗ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
