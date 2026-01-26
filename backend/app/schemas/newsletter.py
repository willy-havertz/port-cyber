from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID


class NewsletterCreate(BaseModel):
    email: EmailStr


class NewsletterResponse(BaseModel):
    id: UUID
    email: str
    is_active: bool
    subscribed_at: datetime

    class Config:
        from_attributes = True


class NewsletterUpdate(BaseModel):
    is_active: bool


class NewsletterSendRequest(BaseModel):
    subject: str
    html_content: str
    text_content: Optional[str] = None
