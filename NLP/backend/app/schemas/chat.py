"""
Pydantic schemas for research chat, messages, citations, and explainability.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Research question or prompt")
    conversation_id: Optional[int] = Field(None, description="Existing conversation ID if continuing thread")
    paper_id: Optional[int] = Field(None, description="Filter question to a specific paper ID")
    top_k: Optional[int] = Field(5, ge=1, le=20)
    similarity_threshold: Optional[float] = Field(0.20, ge=0.0, le=1.0)
    temperature: Optional[float] = Field(0.2, ge=0.0, le=1.0)
    use_hybrid_search: Optional[bool] = True
    use_reranking: Optional[bool] = True


class CitationResponse(BaseModel):
    id: Optional[int] = None
    citation_index: int
    paper_id: int
    paper_title: str
    authors: Optional[str] = None
    publication_year: Optional[int] = None
    page_number: int
    section_name: str
    snippet: str
    confidence_score: float

    model_config = ConfigDict(from_attributes=True)


class EvidenceChunkSchema(BaseModel):
    chunk_id: int
    paper_id: int
    paper_title: str
    page_number: int
    section_name: str
    score: float
    snippet: str


class WhyThisAnswerSchema(BaseModel):
    query_intent: str
    retrieval_strategy: str
    retrieved_chunks_count: int
    similarity_threshold_used: float
    ranked_evidence: List[EvidenceChunkSchema] = []
    reasoning_steps: List[str] = []


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender: str
    content: str
    latency_ms: float
    citations: List[CitationResponse] = []
    why_this_answer: Optional[Dict[str, Any]] = None
    suggested_follow_ups: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    id: int
    title: str
    paper_id: Optional[int] = None
    messages: List[MessageResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
