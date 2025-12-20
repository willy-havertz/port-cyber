from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import re
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
from app.utils.pdf_processor import extract_metadata_from_pdf, suggest_tags, extract_text_and_summary
from app.utils.cloudinary_handler import upload_pdf_to_cloudinary, delete_pdf_from_cloudinary, generate_signed_url
from app.utils.virus_scan import scan_bytes_for_viruses
from app.utils.zip_processor import extract_and_process_zip, validate_readme_structure
from app.utils.ai_generator import ai_generator
import json

router = APIRouter()

def extract_summary_from_markdown(content: str, max_length: int = 200) -> str:
    """Extract first non-heading paragraph from markdown as summary"""
    lines = content.split('\n')
    for line in lines:
        # Skip empty lines and headings
        line = line.strip()
        if line and not line.startswith('#'):
            # Remove markdown formatting
            text = re.sub(r'[*_`\[\]()]', '', line)
            return text[:max_length]
    return ""

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
@router.get("/{writeup_id}")
async def get_writeup(writeup_id: int, db: Session = Depends(get_db)):
    """Get a specific writeup by ID"""
    writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
    if not writeup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Writeup not found"
        )
    return writeup

@router.get("/{writeup_id}/content")
async def get_writeup_content(writeup_id: int, db: Session = Depends(get_db)):
    """Get markdown content of a writeup (if available)"""
    writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
    if not writeup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Writeup not found"
        )
    
    if writeup.content_type != "markdown" or not writeup.writeup_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Markdown content not available for this writeup"
        )
    
    return {
        "id": writeup.id,
        "title": writeup.title,
        "content": writeup.writeup_content,
        "content_type": "markdown"
    }

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
    """Upload a new writeup (Admin only) - supports both PDF and ZIP files"""
    
    try:
        # Read file content
        file_content = await file.read()

        # Virus scan
        clean, reason = scan_bytes_for_viruses(file_content)
        if not clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Upload blocked by virus scan: {reason}"
            )

        # Determine file type
        is_zip = file.filename.endswith('.zip')
        is_pdf = file.filename.endswith('.pdf')

        if not (is_zip or is_pdf):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF and ZIP files are allowed"
            )

        # Process based on file type
        if is_zip:
            # Process ZIP file (README + images)
            try:
                readme_content, images, metadata = await extract_and_process_zip(file_content)
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(e)
                )
            
            # Validate README
            valid, error = validate_readme_structure(readme_content)
            if not valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid README: {error}"
                )
            
            # Create directory for this writeup
            safe_title = "".join(c if c.isalnum() or c in (' ', '_') else '_' for c in title)
            writeup_dir = os.path.join(settings.UPLOAD_DIR, safe_title.replace(" ", "_"))
            os.makedirs(writeup_dir, exist_ok=True)
            
            # Save images locally, preserving directory structure
            for img_name, img_content in images.items():
                # Full path where image will be saved
                img_path = os.path.join(writeup_dir, img_name)
                # Create parent directories if needed
                os.makedirs(os.path.dirname(img_path), exist_ok=True)
                with open(img_path, 'wb') as f:
                    f.write(img_content)
            
            # Update image references in markdown to point to backend URLs
            # Convert backslashes to forward slashes and replace relative paths
            final_content = readme_content
            safe_title_underscore = safe_title.replace(' ', '_')
            for img_name in images.keys():
                # Convert backslashes to forward slashes
                url_path = img_name.replace('\\', '/')
                # Replace in markdown with backend URL (unencoded - browser will handle encoding)
                final_content = final_content.replace(
                    img_name,
                    f"/uploads/writeups/{safe_title_underscore}/{url_path}"
                )
                # Also handle forward slash versions
                final_content = final_content.replace(
                    url_path,
                    f"/uploads/writeups/{safe_title_underscore}/{url_path}"
                )
            
            # Use auto-generated summary from first paragraph of README
            auto_summary = extract_summary_from_markdown(readme_content)
            final_summary = summary or auto_summary
            
            content_type = "markdown"
            writeup_url = None
            thumbnail_url = None

        else:
            # Process PDF file (existing logic)
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            temp_filename = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
            temp_file_path = os.path.join(settings.UPLOAD_DIR, temp_filename)

            with open(temp_file_path, "wb") as buffer:
                buffer.write(file_content)

            pdf_metadata = extract_metadata_from_pdf(temp_file_path)
            full_text, extracted_summary = extract_text_and_summary(temp_file_path)
            suggested_tags_list = suggest_tags(temp_file_path)

            # Clean up temp file
            os.remove(temp_file_path)

            # Upload to Cloudinary
            cloudinary_url, thumbnail_url = await upload_pdf_to_cloudinary(file_content, file.filename)

            final_summary = summary or pdf_metadata.get('summary') or extracted_summary or ''
            content_type = "pdf"
            writeup_url = cloudinary_url
            suggested_tags_list = suggested_tags_list or []
            tags = tags + "," + ",".join(suggested_tags_list)

        # Parse and create tags
        tag_names = [t.strip() for t in tags.split(',') if t.strip()]
        tag_names = list(set(tag_names))

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
            summary=final_summary,
            writeup_url=writeup_url,
            writeup_content=readme_content if is_zip else None,
            content_type=content_type,
            thumbnail_url=thumbnail_url,
            tags=tag_objects
        )

        db.add(writeup)
        db.commit()
        db.refresh(writeup)
        return writeup

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing upload: {str(e)}"
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
        # If new file uploaded, validate, scan, and process
        if file and file.filename:
            # Validate file type
            is_pdf = file.filename.endswith('.pdf')
            is_zip = file.filename.endswith('.zip')
            
            if not is_pdf and not is_zip:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only PDF and ZIP files are allowed"
                )
            
            # Read file content
            file_content = await file.read()

            # Virus scan
            clean, reason = scan_bytes_for_viruses(file_content)
            if not clean:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Upload blocked by virus scan: {reason}"
                )
            
            if is_zip:
                # Handle ZIP file with markdown content
                # Extract and process the ZIP
                markdown_content, images, _ = await extract_and_process_zip(file_content)
                
                # Create a unique folder for this writeup's images
                safe_title = "".join(c if c.isalnum() or c in (' ', '_') else '_' for c in (title or writeup.title))
                writeup_folder = os.path.join(settings.UPLOAD_DIR, safe_title.replace(' ', '_'))
                os.makedirs(writeup_folder, exist_ok=True)
                
                # Save images locally, preserving directory structure from ZIP
                for img_path, img_content in images.items():
                    # Full path where image will be saved
                    full_img_path = os.path.join(writeup_folder, img_path)
                    # Create parent directories if needed
                    os.makedirs(os.path.dirname(full_img_path), exist_ok=True)
                    # Write the image file
                    with open(full_img_path, "wb") as img_file:
                        img_file.write(img_content)
                
                # Update markdown content image references to point to uploaded location
                # Replace all relative image paths with the correct upload URL
                safe_title_underscore = safe_title.replace(' ', '_')
                for img_path in images.keys():
                    # Convert backslashes to forward slashes for URLs
                    url_path = img_path.replace('\\', '/')
                    # Store plain path without encoding - frontend will handle URL encoding
                    markdown_content = markdown_content.replace(
                        img_path,
                        f"/uploads/writeups/{safe_title_underscore}/{url_path}"
                    )
                    # Also handle forward slash versions
                    markdown_content = markdown_content.replace(
                        url_path,
                        f"/uploads/writeups/{safe_title_underscore}/{url_path}"
                    )
                
                # Update writeup fields for markdown
                writeup.writeup_content = markdown_content
                writeup.content_type = "markdown"
                writeup.writeup_url = None
                
                # Extract summary if not provided
                if not summary:
                    summary = extract_summary_from_markdown(markdown_content)
                
            else:  # is_pdf
                # Delete old file from Cloudinary if it exists
                if writeup.writeup_url and "cloudinary.com" in writeup.writeup_url:
                    await delete_pdf_from_cloudinary(writeup.writeup_url)
                
                # Upload new file to Cloudinary
                cloudinary_url, thumbnail_url = await upload_pdf_to_cloudinary(file_content, file.filename)
                writeup.writeup_url = cloudinary_url
                writeup.thumbnail_url = thumbnail_url
                writeup.content_type = "pdf"
                writeup.writeup_content = None
                
                # Extract metadata and suggest tags if not provided
                if not tags:
                    # Use a temporary file for metadata extraction
                    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
                    temp_filename = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
                    temp_file_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
                    
                    with open(temp_file_path, "wb") as buffer:
                        buffer.write(file_content)
                    
                    pdf_metadata = extract_metadata_from_pdf(temp_file_path)
                    _, extracted_summary = extract_text_and_summary(temp_file_path)
                    suggested_tags = suggest_tags(temp_file_path)
                    tags = ",".join(suggested_tags)
                    if not summary:
                        summary = pdf_metadata.get('summary') or extracted_summary
                    
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

@router.post("/{writeup_id}/generate", response_model=WriteupSchema)
async def generate_ai_content(
    writeup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Generate AI content for a writeup (Admin only)"""
    writeup = db.query(Writeup).filter(Writeup.id == writeup_id).first()
    if not writeup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Writeup not found"
        )
    
    try:
        # Generate AI content
        ai_content = await ai_generator.generate_writeup_content(
            title=writeup.title,
            category=writeup.category,
            difficulty=writeup.difficulty,
            platform=writeup.platform,
            summary=writeup.summary or ""
        )
        
        # Store as JSON strings in database
        writeup.methodology = json.dumps(ai_content['methodology'])
        writeup.tools_used = json.dumps(ai_content['tools_used'])
        writeup.key_findings = json.dumps(ai_content['key_findings'])
        writeup.lessons_learned = json.dumps(ai_content['lessons_learned'])
        
        db.commit()
        db.refresh(writeup)
        return writeup
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating AI content: {str(e)}"
        )
