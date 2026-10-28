"""
Pydantic schemas for Research Gap Discovery.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class GapEvidenceItem(BaseModel):
    paper_id: int
    paper_title: str
    page_number: int
    section_name: str
    snippet: str


class ResearchGapItem(BaseModel):
    id: Optional[int] = None
    category: str  # "Underexplored Domain", "Methodological Limitation", "Missing Metrics", "Dataset Generalization", etc.
    title: str
    description: str
    evidence: List[GapEvidenceItem]
    confidence_coverage: str  # "High", "Medium", "Low"
    recommended_future_direction: str


class ResearchGapsResponse(BaseModel):
    analyzed_papers_count: int
    common_themes: List[str]
    common_methodologies: List[str]
    common_datasets: List[str]
    common_limitations: List[str]
    gaps: List[ResearchGapItem]
