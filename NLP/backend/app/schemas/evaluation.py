"""
Pydantic schemas for RAG Evaluation and Benchmarking.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class EvalTestCase(BaseModel):
    id: str
    question: str
    expected_topics: List[str]
    target_paper_titles: List[str]
    ideal_evidence_keywords: List[str]


class EvalResultItem(BaseModel):
    test_id: str
    question: str
    retrieval_precision: float
    retrieval_recall: float
    faithfulness_score: float
    citation_coverage: float
    latency_ms: float
    retrieved_chunks_count: int
    avg_similarity_score: float
    grounded_answer: str
    citations_count: int
    is_grounded: bool


class EvaluationSummaryResponse(BaseModel):
    total_queries_evaluated: int
    mean_retrieval_precision: float
    mean_retrieval_recall: float
    mean_faithfulness_score: float
    mean_citation_coverage: float
    mean_latency_ms: float
    benchmark_results: List[EvalResultItem]
    system_configuration: Dict[str, Any]
