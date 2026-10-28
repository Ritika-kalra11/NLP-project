"""
Citation model linking generated claims directly to retrieved document passages.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_id = Column(Integer, ForeignKey("paper_chunks.id", ondelete="SET NULL"), nullable=True)

    citation_index = Column(Integer, nullable=False, default=1)  # e.g., 1 for [1]
    paper_title = Column(String(255), nullable=False)
    authors = Column(String(255), nullable=True)
    publication_year = Column(Integer, nullable=True)
    page_number = Column(Integer, nullable=False, default=1)
    section_name = Column(String(100), nullable=False, default="Body")
    snippet = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    message = relationship("Message", back_populates="citations")
    paper = relationship("Paper", back_populates="citations")
    chunk = relationship("PaperChunk", back_populates="citations")
