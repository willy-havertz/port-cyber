from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from supabase import create_client, Client

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.core.config import settings
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate, Comment as CommentSchema, CommentUpdate
from app.utils.spam_filter import is_spam

router = APIRouter()

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

@router.get("/{writeup_id}", response_model=List[CommentSchema])
async def get_comments(writeup_id: str, db: Session = Depends(get_db)):
    """Get all approved comments for a writeup"""
    comments = db.query(Comment).filter(
        Comment.writeup_id == writeup_id,
        Comment.is_approved == True,
        Comment.is_spam == False
    ).order_by(Comment.created_at.desc()).all()
    return comments

@router.post("/", response_model=CommentSchema, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    db: Session = Depends(get_db)
):
    """Create a new comment"""
    # Check for spam
    spam_check = is_spam(comment_data.content)
    
    comment = Comment(
        writeup_id=comment_data.writeup_id,
        user_name=comment_data.user_name,
        user_email=comment_data.user_email,
        content=comment_data.content,
        is_spam=spam_check,
        is_approved=not spam_check  # Auto-approve if not spam
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # Also save to Supabase for real-time features
    try:
        supabase.table('comments').insert({
            'writeup_id': comment.writeup_id,
            'user_name': comment.user_name,
            'user_email': comment.user_email,
            'content': comment.content,
            'is_approved': comment.is_approved,
            'is_spam': comment.is_spam
        }).execute()
    except Exception as e:
        print(f"Supabase insert failed: {e}")
    
    return comment

@router.get("/admin/pending", response_model=List[CommentSchema])
async def get_pending_comments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all pending/spam comments for moderation (Admin only)"""
    comments = db.query(Comment).filter(
        (Comment.is_approved == False) | (Comment.is_spam == True)
    ).order_by(Comment.created_at.desc()).all()
    return comments

@router.patch("/{comment_id}", response_model=CommentSchema)
async def moderate_comment(
    comment_id: int,
    update_data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Moderate a comment (Admin only)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(comment, field, value)
    
    db.commit()
    db.refresh(comment)
    return comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a comment (Admin only)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    db.delete(comment)
    db.commit()
    return None
