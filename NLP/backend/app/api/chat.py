"""
Research Assistant Chat API Router.
Handles multi-turn conversational RAG, citation grounding, and explainability tracking.
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.citation import Citation
from app.models.paper import Paper
from app.schemas.chat import ChatRequest, MessageResponse, CitationResponse
from app.rag.pipeline import rag_pipeline

router = APIRouter(prefix="/chat", tags=["Research Chat"])


@router.post("", response_model=MessageResponse)
def chat_with_researchai(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Main RAG conversation endpoint.
    Retrieves grounded evidence from uploaded papers, generates answers with strict citations,
    and returns full explainability metadata.
    """
    query_text = request.query.strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # 1. Manage Conversation Session
    conversation = None
    if request.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == request.conversation_id).first()

    if not conversation:
        title_snippet = query_text[:45] + ("..." if len(query_text) > 45 else "")
        conversation = Conversation(
            title=title_snippet,
            paper_id=request.paper_id
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # 2. Retrieve Conversation History for Chat Memory
    past_messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.asc()).all()

    conv_history = [{"sender": m.sender, "content": m.content} for m in past_messages[-6:]]

    # 3. Store User Utterance
    user_msg = Message(
        conversation_id=conversation.id,
        sender="user",
        content=query_text
    )
    db.add(user_msg)
    db.commit()

    # 4. Execute Unified RAG Pipeline
    rag_result = rag_pipeline.execute(request, conversation_history=conv_history)

    # 5. Store Assistant Utterance
    assistant_msg = Message(
        conversation_id=conversation.id,
        sender="assistant",
        content=rag_result["content"],
        latency_ms=rag_result["latency_ms"],
        why_this_answer=json.dumps(rag_result["why_this_answer"])
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    # 6. Store Citations
    citation_responses: List[CitationResponse] = []
    for cit in rag_result["citations"]:
        p_id = cit["paper_id"]
        # Fallback to first paper if paper_id is None
        if not p_id:
            first_paper = db.query(Paper).first()
            p_id = first_paper.id if first_paper else 1

        db_citation = Citation(
            message_id=assistant_msg.id,
            paper_id=p_id,
            chunk_id=cit.get("chunk_id"),
            citation_index=cit["citation_index"],
            paper_title=cit["paper_title"],
            authors=cit.get("authors", ""),
            publication_year=cit.get("publication_year"),
            page_number=cit.get("page_number", 1),
            section_name=cit.get("section_name", "Body"),
            snippet=cit["snippet"],
            confidence_score=cit["confidence_score"]
        )
        db.add(db_citation)
        citation_responses.append(CitationResponse(
            citation_index=cit["citation_index"],
            paper_id=p_id,
            paper_title=cit["paper_title"],
            authors=cit.get("authors"),
            publication_year=cit.get("publication_year"),
            page_number=cit.get("page_number", 1),
            section_name=cit.get("section_name", "Body"),
            snippet=cit["snippet"],
            confidence_score=cit["confidence_score"]
        ))
    db.commit()

    return MessageResponse(
        id=assistant_msg.id,
        conversation_id=conversation.id,
        sender="assistant",
        content=assistant_msg.content,
        latency_ms=assistant_msg.latency_ms,
        citations=citation_responses,
        why_this_answer=rag_result["why_this_answer"],
        suggested_follow_ups=rag_result["suggested_follow_ups"],
        created_at=assistant_msg.created_at
    )
