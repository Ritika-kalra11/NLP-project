"""
Pydantic schemas for multi-paper comparison and contradiction analysis.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CompareRequest(BaseModel):
    paper_ids: List[int] = Field(..., min_length=2, max_length=10, description="List of paper IDs to compare")
    aspects: Optional[List[str]] = Field(
        default=["problem", "dataset", "method", "model", "metrics", "results", "limitations"],
        description="Aspects to compare across papers"
    )


class PaperAspectDetail(BaseModel):
    summary: str
    evidence_snippet: str
    page_number: int


class ComparisonRow(BaseModel):
    feature: str  # e.g., "Research Problem", "Datasets Used", "Methodology", etc.
    values: Dict[str, PaperAspectDetail]  # paper_id (as str) -> PaperAspectDetail


class ComparisonResponse(BaseModel):
    paper_ids: List[int]
    paper_titles: Dict[str, str]
    matrix: List[ComparisonRow]
    overall_synthesis: str
    grounding_notes: str


class ConsistencyRequest(BaseModel):
    paper_ids: List[int] = Field(..., min_length=2, max_length=10)
    topic_or_claim: Optional[str] = None


class ClaimComparison(BaseModel):
    topic: str
    supporting_points: List[str]
    contrasting_points: List[str]
    condition_differences: List[str]
    verdict: str  # "Complementary", "Differing Experimental Setup", "Inconclusive", "Conflicting"
    evidence_citations: List[Dict[str, Any]]


class ConsistencyResponse(BaseModel):
    paper_titles: Dict[str, str]
    comparisons: List[ClaimComparison]
    summary_verdict: str
