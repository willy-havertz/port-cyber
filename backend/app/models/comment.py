from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    writeup_id = Column(String, nullable=False, index=True)  # Matches writeup.id from frontend
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=True)  # For moderation
    is_spam = Column(Boolean, default=False)
    reply_to_id = Column(Integer, ForeignKey("comments.id"), nullable=True, index=True)  # For nested replies
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Self-referential relationship for nested comments
    replies = relationship("Comment", remote_side=[id], backref="parent_comment")
