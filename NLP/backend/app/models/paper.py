"""
Paper model representing uploaded and processed research documents.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.topic import paper_topics


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    authors = Column(String(255), nullable=True, default="Unknown Authors")
    publication_year = Column(Integer, nullable=True)
    abstract = Column(Text, nullable=True)
    page_count = Column(Integer, default=0)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(Integer, default=0)
    file_hash = Column(String(64), index=True, nullable=True)  # SHA-256 for duplicate detection
    
    # Statuses: UPLOADING, PROCESSING, EXTRACTING, EMBEDDING, INDEXING, COMPLETED, FAILED
    status = Column(String(32), default="PROCESSING", index=True)
    error_message = Column(Text, nullable=True)

    # Pre-computed NLP summaries
    structured_summary = Column(Text, nullable=True)  # JSON string of structured summary
    beginner_summary = Column(Text, nullable=True)
    methodology_overview = Column(Text, nullable=True)
    key_findings = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    chunks = relationship("PaperChunk", back_populates="paper", cascade="all, delete-orphan")
    topics_rel = relationship("Topic", secondary=paper_topics, back_populates="papers")
    citations = relationship("Citation", back_populates="paper", cascade="all, delete-orphan")
