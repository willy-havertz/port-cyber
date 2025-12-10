from sqlalchemy import Column, String, Text, DateTime, Integer, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    ip_address = Column(String(45), index=True)  # Support IPv6
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f"<ContactMessage(id={self.id}, email={self.email}, created_at={self.created_at})>"

class SpamLog(Base):
    __tablename__ = "spam_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(45), index=True)  # Support IPv6
    email = Column(String(255), index=True)
    name = Column(String(100))
    reason = Column(String(255), nullable=False, index=True)
    contact_data = Column(JSON)  # Store the attempted submission
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f"<SpamLog(id={self.id}, reason={self.reason}, created_at={self.created_at})>"
