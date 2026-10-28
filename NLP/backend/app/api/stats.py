"""
Dashboard Statistics & Telemetry Router.
Provides aggregate metrics, recent documents, recent queries, and topic breakdown.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.paper import Paper
from app.models.chunk import PaperChunk
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.topic import Topic
from app.embeddings.vector_store import vector_store

router = APIRouter(prefix="/stats", tags=["Dashboard"])


@router.get("", response_model=Dict[str, Any])
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns high-level research metrics for the dashboard view.
    """
    total_papers = db.query(Paper).count()
    total_pages = db.query(func.sum(Paper.page_count)).scalar() or 0
    total_chunks = db.query(PaperChunk).count()
    total_conversations = db.query(Conversation).count()
    total_vectors = vector_store.count()

    recent_papers = db.query(Paper).order_by(Paper.created_at.desc()).limit(5).all()
    recent_paper_list = [{
        "id": p.id,
        "title": p.title,
        "authors": p.authors,
        "year": p.publication_year,
        "page_count": p.page_count,
        "status": p.status,
        "created_at": p.created_at
    } for p in recent_papers]

    recent_user_messages = db.query(Message).filter(Message.sender == "user").order_by(Message.created_at.desc()).limit(5).all()
    recent_questions = [{
        "id": m.id,
        "conversation_id": m.conversation_id,
        "question": m.content,
        "created_at": m.created_at
    } for m in recent_user_messages]

    topics = db.query(Topic).order_by(Topic.paper_count.desc()).all()
    topic_list = [{
        "id": t.id,
        "name": t.name,
        "paper_count": t.paper_count
    } for t in topics]

    return {
        "total_papers": total_papers,
        "total_pages": total_pages,
        "indexed_chunks": total_chunks,
        "vector_count": total_vectors,
        "total_conversations": total_conversations,
        "recent_papers": recent_paper_list,
        "recent_questions": recent_questions,
        "topics": topic_list
    }
