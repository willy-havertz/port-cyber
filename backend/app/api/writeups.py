from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.models.user import User
from app.models.writeup import Writeup, Tag
from app.schemas.writeup import (
    WriteupCreate,
    Writeup as WriteupSchema,
    WriteupList,
    WriteupUpdate
)
from app.core.config import settings
from app.utils.pdf_processor import extract_metadata_from_pdf, suggest_tags

router = APIRouter()

@router.get("/", response_model=WriteupList)
async def get_writeups(
    skip: int = 0,
    limit: int = 100,
    platform: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all writeups with optional filtering"""
    query = db.query(Writeup)
    
    if platform:
        query = query.filter(Writeup.platform == platform)
    if category:
        query = query.filter(Writeup.category == category)
    if difficulty:
        query = query.filter(Writeup.difficulty == difficulty)
    if search:
        query = query.filter(Writeup.title.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit
    }

@router.get("/{writeup_id}", response_model=WriteupSchema)
async def get_writeup(writeup_id: int, db: Session = Depends(get_db)):
    """Get a specific writeup by ID"""
    writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
    if not writeup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Writeup not found"
        )
    return writeup

@router.post("/", response_model=WriteupSchema, status_code=status.HTTP_201_CREATED)
async def create_writeup(
    title: str = Form(...),
    platform: str = Form(...),
    difficulty: str = Form(...),
    category: str = Form(...),
    date: str = Form(...),
    time_spent: str = Form(...),
    summary: Optional[str] = Form(None),
    tags: str = Form(...),  # Comma-separated tags
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload a new writeup (Admin only)"""
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract metadata and suggest tags
    pdf_metadata = extract_metadata_from_pdf(file_path)
    suggested_tags = suggest_tags(file_path)
    
    # Parse tags
    tag_names = [t.strip() for t in tags.split(',')]
    tag_names.extend(suggested_tags)  # Add auto-suggested tags
    tag_names = list(set(tag_names))  # Remove duplicates
    
    # Create or get tags
    tag_objects = []
    for tag_name in tag_names:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
        tag_objects.append(tag)
    
    # Create writeup
    writeup = Writeup(
        title=title,
        platform=platform,
        difficulty=difficulty,
        category=category,
        date=date,
        time_spent=time_spent,
        summary=summary or pdf_metadata.get('summary', ''),
        writeup_url=f"/uploads/writeups/{filename}",
        tags=tag_objects
    )
    
    db.add(writeup)
    db.commit()
    db.refresh(writeup)
    return writeup

@router.put("/{writeup_id}", response_model=WriteupSchema)
async def update_writeup(
    writeup_id: int,
    writeup_data: WriteupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a writeup (Admin only)"""
    writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
    if not writeup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Writeup not found"
        )
    
    # Update fields
    update_data = writeup_data.dict(exclude_unset=True)
    if 'tags' in update_data:
        tag_names = update_data.pop('tags')
        tag_objects = []
        for tag_name in tag_names:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
            tag_objects.append(tag)
        writeup.tags = tag_objects
    
    for field, value in update_data.items():
        setattr(writeup, field, value)
    
    db.commit()
    db.refresh(writeup)
    return writeup

@router.delete("/{writeup_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_writeup(
    writeup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a writeup (Admin only)"""
    writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
    if not writeup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Writeup not found"
        )
    
    # Delete PDF file
    if os.path.exists(writeup.writeup_url):
        os.remove(writeup.writeup_url)
    
    db.delete(writeup)
    db.commit()
    return None

@router.get("/search/", response_model=WriteupList)
async def search_writeups(
    q: str,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Full-text search across writeups"""
    query = db.query(Writeup).filter(
        Writeup.title.ilike(f"%{q}%") |
        Writeup.summary.ilike(f"%{q}%") |
        Writeup.category.ilike(f"%{q}%")
    )
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit
    }
