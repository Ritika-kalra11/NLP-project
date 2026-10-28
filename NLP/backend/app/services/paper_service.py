"""
Paper Service managing document ingestion, validation, processing lifecycle,
intelligent chunking, vector indexing, and summarization.
"""

import hashlib
import logging
import os
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.models.paper import Paper
from app.models.chunk import PaperChunk
from app.document_processing.pdf_extractor import PDFExtractor
from app.document_processing.chunker import IntelligentChunker
from app.embeddings.embedding_service import embedding_service
from app.embeddings.vector_store import vector_store
from app.rag.bm25_retriever import bm25_retriever
from app.services.summarizer import PaperSummarizer

logger = logging.getLogger(__name__)


class PaperService:
    """Manages the full lifecycle of scientific research papers in ResearchAI."""

    @classmethod
    def validate_file(cls, file: UploadFile) -> None:
        """Validates file extension and size constraints."""
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type for '{file.filename}'. ResearchAI only supports academic PDF documents."
            )

    @classmethod
    async def process_uploaded_pdf(cls, file: UploadFile, db: Session) -> Paper:
        """
        Saves uploaded PDF, validates duplicates, extracts sections, generates embeddings,
        indexes into FAISS, and creates database records.
        """
        cls.validate_file(file)

        # Read file contents into memory to compute hash
        contents = await file.read()
        file_size = len(contents)
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024

        if file_size > max_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
            )

        file_hash = hashlib.sha256(contents).hexdigest()

        # Duplicate check
        existing = db.query(Paper).filter(Paper.file_hash == file_hash).first()
        if existing:
            logger.info(f"Duplicate paper detected: {existing.title} (ID: {existing.id})")
            return existing

        # Sanitize filename and save to uploads folder
        safe_filename = "".join([c for c in file.filename if c.isalnum() or c in "._- "]).strip()
        save_path = Path(settings.UPLOAD_DIR) / f"{file_hash[:12]}_{safe_filename}"

        with open(save_path, "wb") as f:
            f.write(contents)

        # Create Paper record
        paper = Paper(
            title=Path(safe_filename).stem.replace("_", " ").title(),
            authors="Processing...",
            publication_year=2024,
            file_name=safe_filename,
            file_path=str(save_path),
            file_size=file_size,
            file_hash=file_hash,
            status="PROCESSING"
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)

        # Run extraction & indexing pipeline
        try:
            cls.ingest_paper_pipeline(paper, db)
        except Exception as e:
            logger.error(f"Error processing paper {paper.id}: {e}", exc_info=True)
            paper.status = "FAILED"
            paper.error_message = str(e)
            db.commit()

        return paper

    @classmethod
    def ingest_paper_pipeline(cls, paper: Paper, db: Session):
        """Executes the complete document extraction, chunking, embedding, and summarization pipeline."""
        paper.status = "EXTRACTING"
        db.commit()

        # 1. PDF Extraction
        extracted_doc = PDFExtractor.extract_document(paper.file_path)

        paper.title = extracted_doc["title"]
        paper.authors = extracted_doc["authors"]
        paper.publication_year = extracted_doc["publication_year"]
        paper.abstract = extracted_doc["abstract"]
        paper.page_count = extracted_doc["page_count"]
        paper.status = "EMBEDDING"
        db.commit()

        # 2. Intelligent Chunking
        chunker = IntelligentChunker(
            target_chunk_size=settings.CHUNK_SIZE,
            overlap_size=settings.CHUNK_OVERLAP
        )
        raw_chunks = chunker.chunk_document(extracted_doc, paper_id=paper.id)

        if not raw_chunks:
            # Fallback chunk if empty
            raw_chunks = [{
                "paper_id": paper.id,
                "chunk_index": 0,
                "page_number": 1,
                "section_name": "Abstract",
                "text": extracted_doc.get("abstract") or paper.title,
                "token_count": 50
            }]

        # 3. Embedding Generation
        chunk_texts = [c["text"] for c in raw_chunks]
        embeddings = embedding_service.embed_texts(chunk_texts)

        # 4. Vector Database Indexing
        paper.status = "INDEXING"
        db.commit()

        chunks_metadata = []
        for i, chunk in enumerate(raw_chunks):
            meta = dict(chunk)
            meta["paper_title"] = paper.title
            meta["authors"] = paper.authors
            meta["publication_year"] = paper.publication_year
            chunks_metadata.append(meta)

        vector_ids = vector_store.add_chunks(chunks_metadata, embeddings)

        # 5. Persist Chunks in SQLite
        for i, chunk_data in enumerate(raw_chunks):
            db_chunk = PaperChunk(
                paper_id=paper.id,
                chunk_index=chunk_data["chunk_index"],
                page_number=chunk_data["page_number"],
                section_name=chunk_data["section_name"],
                text=chunk_data["text"],
                token_count=chunk_data["token_count"],
                embedding_id=vector_ids[i] if i < len(vector_ids) else None
            )
            db.add(db_chunk)
        db.commit()

        # 6. Update BM25 In-Memory Index
        bm25_retriever.update_corpus(vector_store.get_all_chunks())

        # 7. Generate Structured Summary
        try:
            PaperSummarizer.generate_summary(paper, db)
        except Exception as e:
            logger.warning(f"Summarizer completed with warning for paper {paper.id}: {e}")

        paper.status = "COMPLETED"
        db.commit()
        db.refresh(paper)
        logger.info(f"Successfully processed paper {paper.id}: '{paper.title}' with {len(raw_chunks)} chunks.")

    @classmethod
    def delete_paper(cls, paper_id: int, db: Session):
        """Deletes a paper, removes its vectors from FAISS, and removes physical files."""
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found")

        # Remove from vector store
        vector_store.delete_paper(paper_id)
        bm25_retriever.update_corpus(vector_store.get_all_chunks())

        # Delete physical file
        if paper.file_path and os.path.exists(paper.file_path):
            try:
                os.remove(paper.file_path)
            except Exception as e:
                logger.warning(f"Could not remove physical file {paper.file_path}: {e}")

        # Delete from SQLite
        db.delete(paper)
        db.commit()
        logger.info(f"Deleted paper {paper_id} and its associated vectors.")
