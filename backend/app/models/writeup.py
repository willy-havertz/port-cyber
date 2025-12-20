from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

# Association table for many-to-many relationship between writeups and tags
writeup_tags = Table(
    'writeup_tags',
    Base.metadata,
    Column('writeup_id', Integer, ForeignKey('writeups.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class Platform(str, enum.Enum):
    HACK_THE_BOX = "Hack The Box"
    TRY_HACK_ME = "Try Hack Me"

class Difficulty(str, enum.Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"
    INSANE = "Insane"

class Writeup(Base):
    __tablename__ = "writeups"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    platform = Column(SQLEnum(Platform), nullable=False)
    difficulty = Column(SQLEnum(Difficulty), nullable=False)
    category = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time_spent = Column(String, nullable=False)
    writeup_url = Column(String, nullable=True)  # Path to PDF file (optional, for backward compatibility)
    writeup_content = Column(Text, nullable=True)  # Markdown content (new field for README)
    content_type = Column(String, default="pdf")  # 'pdf' or 'markdown'
    thumbnail_url = Column(String, nullable=True)
    summary = Column(Text)
    
    # AI-generated content fields
    methodology = Column(Text, nullable=True)  # JSON array of methodology steps
    tools_used = Column(Text, nullable=True)  # JSON array of tools
    key_findings = Column(Text, nullable=True)  # JSON array of findings
    lessons_learned = Column(Text, nullable=True)  # JSON array of lessons
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tags = relationship("Tag", secondary=writeup_tags, back_populates="writeups")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    
    # Relationships
    writeups = relationship("Writeup", secondary=writeup_tags, back_populates="tags")
