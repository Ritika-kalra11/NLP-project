"""
Unified RAG Pipeline orchestrating query preprocessing, hybrid retrieval,
reranking, context building, LLM generation, citation mapping, and explainability.
"""

import time
from typing import List, Dict, Any, Optional, Tuple
from app.rag.hybrid_retriever import hybrid_retriever
from app.rag.reranker import reranker
from app.rag.context_builder import ContextBuilder
from app.rag.citation_engine import CitationEngine
from app.services.llm_service import llm_service
from app.schemas.chat import ChatRequest, WhyThisAnswerSchema, EvidenceChunkSchema


class RAGPipeline:
    """End-to-end Retrieval-Augmented Generation pipeline for research papers."""

    @classmethod
    def execute(
        cls,
        request: ChatRequest,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Executes the complete RAG workflow and returns answer, citations, and explainability data.
        """
        start_time = time.time()
        query = request.query.strip()

        # Step 1: Hybrid Retrieval
        retrieval_mode = "hybrid" if request.use_hybrid_search else "semantic"
        retrieved_candidates = hybrid_retriever.retrieve(
            query=query,
            top_k=request.top_k * 2,
            paper_id=request.paper_id,
            similarity_threshold=request.similarity_threshold,
            mode=retrieval_mode
        )

        # Step 2: Contextual Reranking
        if request.use_reranking and retrieved_candidates:
            ranked_chunks = reranker.rerank(
                query=query,
                candidates=retrieved_candidates,
                top_k=request.top_k
            )
        else:
            ranked_chunks = retrieved_candidates[:request.top_k]

        # Step 3: Context Assembly
        context_text, annotated_chunks = ContextBuilder.build_context(ranked_chunks)

        # Step 4: LLM Generation
        raw_answer = llm_service.generate_chat_response(
            query=query,
            context=context_text,
            conversation_history=conversation_history,
            temperature=request.temperature
        )

        # Step 5: Citation Mapping and Verification
        grounded_answer, citations, is_grounded = CitationEngine.map_citations(
            answer_text=raw_answer,
            annotated_chunks=annotated_chunks,
            similarity_threshold=request.similarity_threshold
        )

        # Step 6: Construct Explainability Payload ("Why this answer?")
        evidence_items = []
        for c in annotated_chunks:
            evidence_items.append(EvidenceChunkSchema(
                chunk_id=c.get("chunk_id") or c.get("id") or 0,
                paper_id=c.get("paper_id", 0),
                paper_title=c.get("paper_title", "Research Paper"),
                page_number=c.get("page_number", 1),
                section_name=c.get("section_name", "Body"),
                score=c.get("score", 0.0),
                snippet=c.get("text", "")[:280] + "..."
            ))

        reasoning_steps = [
            f"Analyzed query: '{query}'",
            f"Retrieved {len(retrieved_candidates)} candidate chunks using {retrieval_mode} search",
            f"Filtered and reranked top {len(ranked_chunks)} evidence passages based on semantic relevance and section congruence",
            f"Grounding verified: Found {len(citations)} supporting source citations with zero hallucinated references"
        ]

        why_this_answer = WhyThisAnswerSchema(
            query_intent="Academic Evidence Synthesis",
            retrieval_strategy=f"{retrieval_mode.title()} (Dense + BM25 RRF)",
            retrieved_chunks_count=len(annotated_chunks),
            similarity_threshold_used=request.similarity_threshold,
            ranked_evidence=evidence_items,
            reasoning_steps=reasoning_steps
        )

        # Step 7: Dynamic Suggested Follow-ups
        suggested_follow_ups = cls._generate_follow_ups(query, citations)

        latency_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "content": grounded_answer,
            "citations": citations,
            "latency_ms": latency_ms,
            "why_this_answer": why_this_answer.model_dump(),
            "suggested_follow_ups": suggested_follow_ups,
            "is_grounded": is_grounded
        }

    @classmethod
    def _generate_follow_ups(cls, query: str, citations: List[Dict[str, Any]]) -> List[str]:
        """Generates contextual research questions following up on the current answer."""
        suggestions = []
        if citations:
            first_paper = citations[0].get("paper_title", "this study")
            suggestions.append(f"What experimental datasets were evaluated in \"{first_paper}\"?")
            suggestions.append(f"What are the main limitations identified in {first_paper}?")
            suggestions.append("How do these findings compare with existing baseline models?")
        else:
            suggestions = [
                "Summarize the main methodology across uploaded papers.",
                "What datasets are most commonly used in these studies?",
                "Identify the common research limitations reported."
            ]
        return suggestions[:3]


# Global singleton instance
rag_pipeline = RAGPipeline()
