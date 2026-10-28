"""
Search API Router.
Provides semantic, keyword, and hybrid information retrieval across document chunks.
"""

import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.search import SearchRequest, SearchResponse, SearchResultItem
from app.rag.hybrid_retriever import hybrid_retriever

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
def execute_search(
    request: SearchRequest,
    db: Session = Depends(get_db)
):
    """
    Executes semantic, keyword, or hybrid search across indexed research paper chunks.
    """
    start_time = time.time()
    query_text = request.query.strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    raw_results = hybrid_retriever.retrieve(
        query=query_text,
        top_k=request.top_k,
        paper_id=request.paper_id,
        similarity_threshold=request.similarity_threshold,
        mode=request.mode
    )

    items = []
    for r in raw_results:
        items.append(SearchResultItem(
            chunk_id=r.get("chunk_id") or r.get("id") or 0,
            paper_id=r.get("paper_id", 0),
            paper_title=r.get("paper_title", "Research Paper"),
            authors=r.get("authors"),
            publication_year=r.get("publication_year"),
            page_number=r.get("page_number", 1),
            section_name=r.get("section_name", "Body"),
            text=r.get("text", ""),
            score=r.get("score", 0.0),
            retrieval_source=r.get("retrieval_source", request.mode)
        ))

    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    return SearchResponse(
        query=query_text,
        mode=request.mode,
        total_results=len(items),
        results=items,
        execution_time_ms=elapsed_ms
    )
