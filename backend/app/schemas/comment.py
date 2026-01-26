from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class CommentBase(BaseModel):
    writeup_id: str
    user_name: str
    user_email: EmailStr
    content: str

class CommentCreate(CommentBase):
    pass

class CommentReply(CommentBase):
    reply_to_id: int  # ID of the comment being replied to

class CommentUpdate(BaseModel):
    content: Optional[str] = None
    is_approved: Optional[bool] = None
    is_spam: Optional[bool] = None

class Comment(CommentBase):
    id: int
    is_approved: bool
    is_spam: bool
    reply_to_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    replies: List['Comment'] = []

    class Config:
        from_attributes = True

Comment.model_rebuild()
