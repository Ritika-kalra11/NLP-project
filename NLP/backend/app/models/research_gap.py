"""
ResearchGap model storing synthesized gap analyses backed by evidence.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.session import Base


class ResearchGap(Base):
    __tablename__ = "research_gaps"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(100), nullable=False, default="General")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    # JSON list of evidence items: [{"paper_id": 1, "title": "...", "page": 4, "snippet": "..."}]
    evidence_json = Column(Text, nullable=False, default="[]")
    
    # High, Medium, Low evidence coverage
    confidence_coverage = Column(String(20), nullable=False, default="Medium")
    
    created_at = Column(DateTime, default=datetime.utcnow)
