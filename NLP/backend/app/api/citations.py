"""
Citation Map API Router.
Provides author bibliography search, citation network exploration,
earlier work (foundational literature), and future work (subsequent citing papers).
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.paper import Paper
from app.services.citation_map_service import CitationMapService

router = APIRouter(prefix="/citations", tags=["Citation Map"])


@router.get("/search", response_model=Dict[str, Any])
def search_author_or_citation(
    q: str = Query(..., min_length=1, description="Author name, paper title, or citation query"),
    db: Session = Depends(get_db)
):
    """
    Searches by author name or paper citation/title.
    Returns author profile, earlier work, future work, and 2D citation network graph.
    """
    result = CitationMapService.search_author_or_citation(query=q, db=db)
    return result


@router.get("/authors", response_model=List[Dict[str, Any]])
def get_authors(
    db: Session = Depends(get_db)
):
    """
    Returns list of all authors across the paper corpus with paper counts, topics, and collaborators.
    """
    authors = CitationMapService.get_all_authors(db)
    return authors


@router.get("/paper/{paper_id}/map", response_model=Dict[str, Any])
@router.get("/paper/{paper_id}/litmap", response_model=Dict[str, Any])
def get_paper_citation_map(
    paper_id: int,
    db: Session = Depends(get_db)
):
    """
    Builds citation network around a specific seed paper, including earlier and future works.
    """
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paper with ID {paper_id} not found."
        )

    map_data = CitationMapService.build_litmap_for_paper(paper=paper, db=db)
    return map_data
