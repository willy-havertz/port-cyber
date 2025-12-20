from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime
import json

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int

    class Config:
        from_attributes = True

class WriteupBase(BaseModel):
    title: str
    platform: str
    difficulty: str
    category: str
    date: str
    time_spent: str
    summary: Optional[str] = None
    thumbnail_url: Optional[str] = None
    writeup_url: Optional[str] = None  # Optional for markdown-based writeups
    writeup_content: Optional[str] = None
    content_type: str = "pdf"  # 'pdf' or 'markdown'
    
    # AI-generated content
    methodology: Optional[List[str]] = None
    tools_used: Optional[List[str]] = None
    key_findings: Optional[List[str]] = None
    lessons_learned: Optional[List[str]] = None

class WriteupCreate(WriteupBase):
    tags: List[str]

class WriteupUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    time_spent: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None

class Writeup(WriteupBase):
    id: int
    tags: List[Tag]
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('methodology', 'tools_used', 'key_findings', 'lessons_learned', mode='before')
    @classmethod
    def parse_json_fields(cls, v):
        """Parse JSON strings to lists"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return None
        return v

    class Config:
        from_attributes = True

class WriteupList(BaseModel):
    items: List[Writeup]
    total: int
    page: int
    page_size: int
