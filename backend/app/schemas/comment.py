from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class CommentBase(BaseModel):
    writeup_id: str
    user_name: str
    user_email: EmailStr
    content: str

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: Optional[str] = None
    is_approved: Optional[bool] = None
    is_spam: Optional[bool] = None

class Comment(CommentBase):
    id: int
    is_approved: bool
    is_spam: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
