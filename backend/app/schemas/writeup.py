from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
    writeup_url: str
    tags: List[Tag]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WriteupList(BaseModel):
    items: List[Writeup]
    total: int
    page: int
    page_size: int
