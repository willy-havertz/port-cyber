from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import logging
 # from supabase import create_client, Client

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.core.config import settings
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentReply, Comment as CommentSchema, CommentUpdate
from app.utils.spam_filter import is_spam
from app.utils.email_templates import reply_notification_email

router = APIRouter()
logger = logging.getLogger(__name__)

 # Supabase integration disabled for Neon-only backend
supabase = None

# Initialize Resend client
try:
    import resend
    resend.api_key = settings.RESEND_API_KEY
    RESEND_CLIENT = resend
except Exception as e:
    logger.warning(f"Resend client initialization failed: {e}")
    RESEND_CLIENT = None


async def send_reply_notification(recipient_email: str, commenter_name: str, reply_preview: str, writeup_id: str):
    """Send email notification when someone replies to a comment"""
    if RESEND_CLIENT and settings.ADMIN_EMAIL:
        try:
            RESEND_CLIENT.Emails.send({
                "from": "notifications@resend.dev",
                "to": recipient_email,
                "subject": f"💬 {commenter_name} replied to your comment",
                "html": reply_notification_email(commenter_name, reply_preview, writeup_id)
            })
            logger.info(f"Reply notification sent to {recipient_email}")
        except Exception as e:
            logger.error(f"Error sending reply notification: {e}")


def build_comment_tree(comments: list, parent_id: int = None) -> list:
    """Build nested comment tree structure"""
    tree = []
    for comment in comments:
        if comment.reply_to_id == parent_id:
            # Find all replies to this comment
            comment.replies = build_comment_tree(comments, comment.id)
            tree.append(comment)
    return tree


@router.get("/{writeup_id}", response_model=List[CommentSchema])
async def get_comments(writeup_id: str, db: Session = Depends(get_db)):
    """Get all approved comments for a writeup with nested replies"""
    # Get all approved comments for this writeup (including replies)
    all_comments = db.query(Comment).filter(
        Comment.writeup_id == writeup_id,
        Comment.is_approved == True,
        Comment.is_spam == False,
    ).order_by(Comment.created_at.asc()).all()
    
    # Build nested tree structure - only return top-level comments with their replies
    top_level_comments = build_comment_tree(all_comments, None)
    
    # Reverse to show newest first
    top_level_comments.reverse()
    
    return top_level_comments

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
    
    # Supabase integration removed
    
    return comment

@router.post("/{comment_id}/reply", response_model=CommentSchema, status_code=status.HTTP_201_CREATED)
async def reply_to_comment(
    comment_id: int,
    reply_data: CommentReply,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Reply to a specific comment and notify original commenter"""
    # Get parent comment
    parent_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not parent_comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent comment not found"
        )
    
    # Check for spam
    spam_check = is_spam(reply_data.content)
    
    # Create reply comment
    reply_comment = Comment(
        writeup_id=reply_data.writeup_id,
        user_name=reply_data.user_name,
        user_email=reply_data.user_email,
        content=reply_data.content,
        reply_to_id=comment_id,
        is_spam=spam_check,
        is_approved=not spam_check  # Auto-approve if not spam
    )
    
    db.add(reply_comment)
    db.commit()
    db.refresh(reply_comment)
    
    # Send notification to original commenter
    if parent_comment.user_email != reply_data.user_email:  # Don't notify if replying to own comment
        background_tasks.add_task(
            send_reply_notification,
            parent_comment.user_email,
            reply_data.user_name,
            reply_data.content,
            reply_data.writeup_id
        )
    
    return reply_comment

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
