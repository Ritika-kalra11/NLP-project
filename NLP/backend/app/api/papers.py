"""
Papers API Router.
Handles PDF upload, document listing, filtering, text inspection, summarization, and deletion.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.paper import Paper
from app.models.chunk import PaperChunk
from app.schemas.paper import PaperResponse, PaperDetailResponse, ExtractedTextResponse, ExtractedPageSchema
from app.services.paper_service import PaperService
from app.services.summarizer import PaperSummarizer

router = APIRouter(prefix="/papers", tags=["Papers"])


@router.post("/upload", response_model=List[PaperResponse])
async def upload_papers(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload one or multiple scientific PDF papers.
    Validates file format, extracts text, computes intelligent chunks, and builds vector index.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    processed_papers = []
    for file in files:
        paper = await PaperService.process_uploaded_pdf(file, db)
        # Parse structured summary for response if present
        struct_summary = json.loads(paper.structured_summary) if paper.structured_summary else None
        paper_resp = PaperResponse(
            id=paper.id,
            title=paper.title,
            authors=paper.authors,
            publication_year=paper.publication_year,
            abstract=paper.abstract,
            page_count=paper.page_count,
            file_name=paper.file_name,
            file_size=paper.file_size,
            status=paper.status,
            error_message=paper.error_message,
            topics=[t.name for t in paper.topics_rel],
            structured_summary=struct_summary,
            beginner_summary=paper.beginner_summary,
            created_at=paper.created_at,
            updated_at=paper.updated_at
        )
        processed_papers.append(paper_resp)

    return processed_papers


@router.get("", response_model=List[PaperResponse])
def get_papers(
    search: Optional[str] = Query(None, description="Search by title or author"),
    author: Optional[str] = Query(None, description="Filter by author"),
    year: Optional[int] = Query(None, description="Filter by publication year"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    db: Session = Depends(get_db)
):
    """
    Retrieves the collection of indexed research papers with optional filtering.
    """
    query = db.query(Paper)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(or_(Paper.title.ilike(search_fmt), Paper.authors.ilike(search_fmt)))

    if author:
        query = query.filter(Paper.authors.ilike(f"%{author.strip()}%"))

    if year:
        query = query.filter(Paper.publication_year == year)

    papers = query.order_by(Paper.created_at.desc()).all()

    results = []
    for p in papers:
        # Topic filter
        topic_names = [t.name for t in p.topics_rel]
        if topic and not any(topic.lower() in tn.lower() for tn in topic_names):
            continue

        struct_summary = json.loads(p.structured_summary) if p.structured_summary else None
        results.append(PaperResponse(
            id=p.id,
            title=p.title,
            authors=p.authors,
            publication_year=p.publication_year,
            abstract=p.abstract,
            page_count=p.page_count,
            file_name=p.file_name,
            file_size=p.file_size,
            status=p.status,
            error_message=p.error_message,
            topics=topic_names,
            structured_summary=struct_summary,
            beginner_summary=p.beginner_summary,
            created_at=p.created_at,
            updated_at=p.updated_at
        ))

    return results


@router.get("/{paper_id}", response_model=PaperDetailResponse)
def get_paper(paper_id: int, db: Session = Depends(get_db)):
    """Retrieves full details, summary, and chunk counts for a specific paper."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    chunks_count = db.query(PaperChunk).filter(PaperChunk.paper_id == paper.id).count()
    struct_summary = json.loads(paper.structured_summary) if paper.structured_summary else None

    return PaperDetailResponse(
        id=paper.id,
        title=paper.title,
        authors=paper.authors,
        publication_year=paper.publication_year,
        abstract=paper.abstract,
        page_count=paper.page_count,
        file_name=paper.file_name,
        file_size=paper.file_size,
        status=paper.status,
        error_message=paper.error_message,
        topics=[t.name for t in paper.topics_rel],
        structured_summary=struct_summary,
        beginner_summary=paper.beginner_summary,
        chunks_count=chunks_count,
        created_at=paper.created_at,
        updated_at=paper.updated_at
    )


@router.get("/{paper_id}/text", response_model=ExtractedTextResponse)
def get_paper_extracted_text(paper_id: int, db: Session = Depends(get_db)):
    """
    Retrieves full page-by-page extracted text and sections for the PDF viewer.
    """
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == paper.id).order_by(PaperChunk.page_number, PaperChunk.chunk_index).all()

    # Group text by page number
    pages_dict = {}
    for c in chunks:
        if c.page_number not in pages_dict:
            pages_dict[c.page_number] = {"text_chunks": [], "sections": set()}
        pages_dict[c.page_number]["text_chunks"].append(c.text)
        pages_dict[c.page_number]["sections"].add(c.section_name)

    pages_list = []
    for p_num in sorted(pages_dict.keys()):
        p_data = pages_dict[p_num]
        pages_list.append(ExtractedPageSchema(
            page_number=p_num,
            text="\n\n".join(p_data["text_chunks"]),
            sections=list(p_data["sections"])
        ))

    return ExtractedTextResponse(
        paper_id=paper.id,
        title=paper.title,
        file_name=paper.file_name,
        page_count=paper.page_count,
        pages=pages_list
    )


@router.post("/{paper_id}/summarize")
def summarize_paper(paper_id: int, db: Session = Depends(get_db)):
    """Forces regeneration of structured 11-dimension summary and beginner explanation."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Reset existing summaries to force fresh generation
    paper.structured_summary = None
    paper.beginner_summary = None
    db.commit()

    result = PaperSummarizer.generate_summary(paper, db)
    return result


@router.delete("/{paper_id}")
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    """Deletes paper, removes embeddings from FAISS, and refreshes search indices."""
    PaperService.delete_paper(paper_id, db)
    return {"message": f"Paper {paper_id} successfully deleted."}
