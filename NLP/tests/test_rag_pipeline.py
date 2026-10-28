"""
Unit and integration tests for Hybrid RAG Pipeline, Grounding, and Citations.
"""

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.rag.pipeline import rag_pipeline
from app.schemas.chat import ChatRequest
from app.rag.citation_engine import CitationEngine


def test_rag_query_with_grounded_answer():
    req = ChatRequest(
        query="What is the computational complexity of SparseSciFormer?",
        top_k=5,
        similarity_threshold=0.20
    )
    result = rag_pipeline.execute(req)

    assert result["is_grounded"] is True
    assert len(result["citations"]) > 0
    assert result["latency_ms"] > 0
    assert "SparseSciFormer" in result["content"] or "complexity" in result["content"]

    # Verify citation structure
    cit = result["citations"][0]
    assert "paper_title" in cit
    assert "page_number" in cit
    assert "section_name" in cit
    assert len(cit["snippet"]) > 0


def test_rag_refusal_on_irrelevant_query():
    req = ChatRequest(
        query="How to make an apple pie on Mount Everest?",
        similarity_threshold=0.25
    )
    result = rag_pipeline.execute(req)

    assert result["is_grounded"] is False
    assert result["content"] == CitationEngine.INSUFFICIENT_EVIDENCE_MESSAGE
    assert len(result["citations"]) == 0


if __name__ == "__main__":
    test_rag_query_with_grounded_answer()
    test_rag_refusal_on_irrelevant_query()
    print("All RAG pipeline tests passed successfully!")
