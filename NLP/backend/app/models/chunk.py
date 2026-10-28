"""
PaperChunk model storing granular, structure-aware passages.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class PaperChunk(Base):
    __tablename__ = "paper_chunks"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=False, default=1)
    section_name = Column(String(100), nullable=False, default="Body")
    text = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    embedding_id = Column(Integer, nullable=True, index=True)  # Index in FAISS vector store
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    paper = relationship("Paper", back_populates="chunks")
    citations = relationship("Citation", back_populates="chunk")
