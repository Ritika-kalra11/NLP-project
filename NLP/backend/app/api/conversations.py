"""
Conversations API Router.
Manages research chat sessions, persistent history, citations, and conversation threads.
"""

import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.citation import Citation
from app.schemas.chat import ConversationResponse, MessageResponse, CitationResponse

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("", response_model=List[Dict[str, Any]])
def list_conversations(db: Session = Depends(get_db)):
    """Lists all active research chat sessions."""
    convs = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    results = []
    for c in convs:
        msg_count = db.query(Message).filter(Message.conversation_id == c.id).count()
        results.append({
            "id": c.id,
            "title": c.title,
            "paper_id": c.paper_id,
            "message_count": msg_count,
            "created_at": c.created_at,
            "updated_at": c.updated_at
        })
    return results


@router.get("/{conv_id}", response_model=ConversationResponse)
def get_conversation(conv_id: int, db: Session = Depends(get_db)):
    """Retrieves full conversation thread with citations and explainability data."""
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()

    msg_responses: List[MessageResponse] = []
    for m in messages:
        citations = db.query(Citation).filter(Citation.message_id == m.id).order_by(Citation.citation_index.asc()).all()
        cit_resps = [
            CitationResponse(
                id=c.id,
                citation_index=c.citation_index,
                paper_id=c.paper_id,
                paper_title=c.paper_title,
                authors=c.authors,
                publication_year=c.publication_year,
                page_number=c.page_number,
                section_name=c.section_name,
                snippet=c.snippet,
                confidence_score=c.confidence_score
            )
            for c in citations
        ]

        why_data = json.loads(m.why_this_answer) if m.why_this_answer else None

        msg_responses.append(MessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender=m.sender,
            content=m.content,
            latency_ms=m.latency_ms,
            citations=cit_resps,
            why_this_answer=why_data,
            suggested_follow_ups=[],
            created_at=m.created_at
        ))

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        paper_id=conv.paper_id,
        messages=msg_responses,
        created_at=conv.created_at,
        updated_at=conv.updated_at
    )


@router.delete("/{conv_id}")
def delete_conversation(conv_id: int, db: Session = Depends(get_db)):
    """Deletes a conversation session and all its messages."""
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": f"Conversation {conv_id} deleted."}
