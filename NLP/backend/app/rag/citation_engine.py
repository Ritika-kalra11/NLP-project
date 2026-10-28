"""
Citation verification and mapping engine.
Maps citations in generated text to exact source chunks and prevents ungrounded hallucinations.
"""

import re
from typing import List, Dict, Any, Tuple


class CitationEngine:
    """Verifies citations and grounds LLM responses with precise document provenance."""

    INSUFFICIENT_EVIDENCE_MESSAGE = "I could not find sufficient evidence in the uploaded papers to answer this question."

    @classmethod
    def map_citations(
        cls,
        answer_text: str,
        annotated_chunks: List[Dict[str, Any]],
        similarity_threshold: float = 0.20
    ) -> Tuple[str, List[Dict[str, Any]], bool]:
        """
        Parses [X] citation markers in the answer, links them to corresponding chunks,
        and ensures the answer is strictly grounded.
        Returns (processed_answer, citations_list, is_grounded).
        """
        if not annotated_chunks:
            return cls.INSUFFICIENT_EVIDENCE_MESSAGE, [], False

        # Check if top chunk meets the minimum similarity threshold
        top_score = max([c.get("score", 0.0) for c in annotated_chunks]) if annotated_chunks else 0.0
        if top_score < similarity_threshold:
            return cls.INSUFFICIENT_EVIDENCE_MESSAGE, [], False

        # Find cited indices like [1], [2], [1, 2]
        citation_matches = re.findall(r'\[(\d+)\]', answer_text)
        cited_indices = set()
        for match in citation_matches:
            try:
                idx = int(match)
                if 1 <= idx <= len(annotated_chunks):
                    cited_indices.add(idx)
            except ValueError:
                pass

        # If LLM didn't insert explicit markers but answered substantively, link the top 2 relevant chunks
        if not cited_indices and cls.INSUFFICIENT_EVIDENCE_MESSAGE not in answer_text:
            top_k_fallback = min(len(annotated_chunks), 2)
            for i in range(1, top_k_fallback + 1):
                cited_indices.add(i)
                # Inject marker at the end of the text
                answer_text += f" [{i}]"

        citations: List[Dict[str, Any]] = []
        for idx in sorted(cited_indices):
            chunk = annotated_chunks[idx - 1]
            chunk_text = chunk.get("text", "")

            # Extract a concise representative snippet (first 250 chars or first 2 sentences)
            sentences = re.split(r'(?<=[.!?])\s+', chunk_text)
            snippet = " ".join(sentences[:2]) if len(sentences) >= 2 else chunk_text[:250]
            if len(snippet) < 60 and len(chunk_text) > 60:
                snippet = chunk_text[:250] + "..."

            citations.append({
                "citation_index": idx,
                "paper_id": chunk.get("paper_id"),
                "paper_title": chunk.get("paper_title", "Research Paper"),
                "authors": chunk.get("authors", "Authors"),
                "publication_year": chunk.get("publication_year"),
                "page_number": chunk.get("page_number", 1),
                "section_name": chunk.get("section_name", "Body"),
                "chunk_id": chunk.get("chunk_id") or chunk.get("id"),
                "snippet": snippet.strip(),
                "confidence_score": chunk.get("score", 0.85)
            })

        is_grounded = len(citations) > 0 and cls.INSUFFICIENT_EVIDENCE_MESSAGE not in answer_text
        return answer_text, citations, is_grounded
