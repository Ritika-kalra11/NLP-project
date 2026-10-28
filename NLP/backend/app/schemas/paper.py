"""
Pydantic schemas for Paper entities and summaries.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class TopicSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    paper_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class PaperChunkSchema(BaseModel):
    id: int
    chunk_index: int
    page_number: int
    section_name: str
    text: str
    token_count: int

    model_config = ConfigDict(from_attributes=True)


class StructuredSummarySchema(BaseModel):
    one_line_summary: str
    abstract_summary: str
    research_problem: str
    objectives: List[str]
    methodology: str
    dataset: str
    model_or_algorithm: str
    results: str
    limitations: str
    future_work: str
    key_contributions: List[str]


class PaperResponse(BaseModel):
    id: int
    title: str
    authors: Optional[str] = None
    publication_year: Optional[int] = None
    abstract: Optional[str] = None
    page_count: int
    file_name: str
    file_size: int
    status: str
    error_message: Optional[str] = None
    topics: List[str] = []
    structured_summary: Optional[Dict[str, Any]] = None
    beginner_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaperDetailResponse(PaperResponse):
    chunks_count: int = 0


class ExtractedPageSchema(BaseModel):
    page_number: int
    text: str
    sections: List[str] = []


class ExtractedTextResponse(BaseModel):
    paper_id: int
    title: str
    file_name: Optional[str] = None
    page_count: int
    pages: List[ExtractedPageSchema]
