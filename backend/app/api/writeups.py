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
from app.utils.cloudinary_handler import upload_pdf_to_cloudinary, delete_pdf_from_cloudinary, generate_signed_url

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
    
    # Order by creation date descending (newest first)
    query = query.order_by(Writeup.created_at.desc())
    
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

@router.get("/{writeup_id}/download-url")
async def get_writeup_download_url(writeup_id: int, db: Session = Depends(get_db)):
    """
    Get a time-limited signed URL for downloading the writeup PDF.
    URL expires after 1 hour. Public endpoint—no authentication required.
    """
    writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
    if not writeup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Writeup not found"
        )
    
    if not writeup.writeup_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No PDF available for this writeup"
        )
    
    try:
        # Extract public_id from Cloudinary URL
        url_parts = writeup.writeup_url.split("/")
        
        # Find the public_id (everything after /upload/v{version}/)
        if "upload" in url_parts:
            upload_idx = url_parts.index("upload")
            public_id_parts = url_parts[upload_idx + 2:]  # Skip 'upload' and 'v{version}'
            public_id = "/".join(public_id_parts).replace(".pdf", "")
        else:
            raise ValueError("Invalid Cloudinary URL format")
        
        # Generate signed URL with 1-hour expiration
        signed_url = generate_signed_url(public_id, expiration_hours=1)
        
        return {
            "download_url": signed_url,
            "expires_in": "1 hour"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating download URL: {str(e)}"
        )

@router.post("/", response_model=WriteupSchema, status_code=status.HTTP_201_CREATED)
async def create_writeup(
    title: str = Form(...),
    platform: str = Form(...),
    difficulty: str = Form(...),
    category: str = Form(...),
    date: str = Form(...),
    time_spent: str = Form(...),
    summary: Optional[str] = Form(None),
    tags: str = Form(""),  # Optional, comma-separated tags
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
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Upload to Cloudinary
        cloudinary_url = await upload_pdf_to_cloudinary(file_content, file.filename)
        
        # Extract metadata and suggest tags from file content
        # We'll use a temporary file for this
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        temp_filename = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        temp_file_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
        
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_content)
        
        pdf_metadata = extract_metadata_from_pdf(temp_file_path)
        suggested_tags = suggest_tags(temp_file_path)
        
        # Clean up temp file
        os.remove(temp_file_path)
        
        # Parse tags
        tag_names = [t.strip() for t in tags.split(',') if t.strip()]
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
        
        # Create writeup with Cloudinary URL
        writeup = Writeup(
            title=title,
            platform=platform,
            difficulty=difficulty,
            category=category,
            date=date,
            time_spent=time_spent,
            summary=summary or pdf_metadata.get('summary', ''),
            writeup_url=cloudinary_url,
            tags=tag_objects
        )
        
        db.add(writeup)
        db.commit()
        db.refresh(writeup)
        return writeup
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing PDF: {str(e)}"
        )

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

@router.put("/{writeup_id}/upload", response_model=WriteupSchema)
async def update_writeup_with_file(
    writeup_id: int,
    title: Optional[str] = Form(None),
    platform: Optional[str] = Form(None),
    difficulty: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    time_spent: Optional[str] = Form(None),
    summary: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a writeup with optional new file upload (Admin only)"""
    writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
    if not writeup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Writeup not found"
        )
    
    try:
        # If new file uploaded, validate and upload to Cloudinary
        if file and file.filename:
            # Validate file type
            if not file.filename.endswith('.pdf'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only PDF files are allowed"
                )
            
            # Read file content
            file_content = await file.read()
            
            # Delete old file from Cloudinary if it exists
            if writeup.writeup_url and "cloudinary.com" in writeup.writeup_url:
                await delete_pdf_from_cloudinary(writeup.writeup_url)
            
            # Upload new file to Cloudinary
            cloudinary_url = await upload_pdf_to_cloudinary(file_content, file.filename)
            writeup.writeup_url = cloudinary_url
            
            # Extract metadata and suggest tags if not provided
            if not tags:
                # Use a temporary file for metadata extraction
                os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
                temp_filename = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
                temp_file_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
                
                with open(temp_file_path, "wb") as buffer:
                    buffer.write(file_content)
                
                pdf_metadata = extract_metadata_from_pdf(temp_file_path)
                suggested_tags = suggest_tags(temp_file_path)
                tags = ",".join(suggested_tags)
                
                # Clean up temp file
                os.remove(temp_file_path)
        
        # Update other fields
        if title is not None:
            writeup.title = title
        if platform is not None:
            writeup.platform = platform
        if difficulty is not None:
            writeup.difficulty = difficulty
        if category is not None:
            writeup.category = category
        if date is not None:
            writeup.date = date
        if time_spent is not None:
            writeup.time_spent = time_spent
        if summary is not None:
            writeup.summary = summary
        
        # Handle tags
        if tags is not None:
            tag_names = [t.strip() for t in tags.split(',') if t.strip()]
            tag_objects = []
            for tag_name in tag_names:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                tag_objects.append(tag)
            writeup.tags = tag_objects
        
        # Update timestamp to track edits, but don't affect ordering
        writeup.updated_at = datetime.now()
        
        db.commit()
        db.refresh(writeup)
        return writeup
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing PDF: {str(e)}"
        )

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
    
    # Delete PDF from Cloudinary if it exists
    if writeup.writeup_url and "cloudinary.com" in writeup.writeup_url:
        try:
            await delete_pdf_from_cloudinary(writeup.writeup_url)
        except:
            pass  # Continue even if deletion fails
    
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
