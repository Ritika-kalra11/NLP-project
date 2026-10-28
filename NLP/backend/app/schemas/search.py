"""
Pydantic schemas for semantic and hybrid search.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    paper_id: Optional[int] = None
    top_k: int = Field(10, ge=1, le=50)
    mode: str = Field("hybrid", description="Mode: 'semantic', 'keyword', or 'hybrid'")
    similarity_threshold: float = Field(0.15, ge=0.0, le=1.0)


class SearchResultItem(BaseModel):
    chunk_id: int
    paper_id: int
    paper_title: str
    authors: Optional[str] = None
    publication_year: Optional[int] = None
    page_number: int
    section_name: str
    text: str
    score: float
    retrieval_source: str  # "vector", "bm25", or "hybrid"


class SearchResponse(BaseModel):
    query: str
    mode: str
    total_results: int
    results: List[SearchResultItem]
    execution_time_ms: float
