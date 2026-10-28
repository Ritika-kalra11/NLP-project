"""
Contextual Reranker for academic research queries.
Adjusts rank scores using section alignment, keyword density, and title relevance.
"""

import re
from typing import List, Dict, Any


class ContextualReranker:
    """Reranks candidate chunks by measuring intent-to-section congruence and lexical density."""

    INTENT_SECTION_MAPPINGS = {
        "methodology": ["Methodology", "Architecture", "Proposed Method", "Approach", "Model"],
        "method": ["Methodology", "Architecture", "Proposed Method", "Approach", "Model"],
        "architecture": ["Methodology", "Architecture", "Proposed Method", "Model"],
        "dataset": ["Dataset", "Datasets", "Data Collection", "Experiments", "Benchmark"],
        "data": ["Dataset", "Datasets", "Data Collection", "Experiments"],
        "results": ["Results", "Empirical Results", "Performance Analysis", "Experiments"],
        "accuracy": ["Results", "Performance Analysis"],
        "limitation": ["Limitations", "Threats to Validity", "Discussion"],
        "weakness": ["Limitations", "Discussion"],
        "future": ["Conclusion", "Future Work"],
        "gap": ["Limitations", "Future Work", "Discussion"],
        "introduction": ["Introduction", "Overview", "Abstract"],
        "summary": ["Abstract", "Introduction", "Conclusion"],
        "problem": ["Abstract", "Introduction", "Related Work"]
    }

    def rerank(self, query: str, candidates: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Reranks a list of retrieved chunk candidates.
        """
        if not candidates:
            return []

        query_lower = query.lower()
        query_words = set(re.findall(r'\b[a-z0-9_\-]{3,}\b', query_lower))

        # Detect intent keywords in query
        preferred_sections = []
        for kw, sections in self.INTENT_SECTION_MAPPINGS.items():
            if kw in query_lower:
                preferred_sections.extend(sections)

        reranked = []
        for item in candidates:
            score = float(item.get("score", 0.5))
            text = item.get("text", "").lower()
            section = item.get("section_name", "")
            title = item.get("paper_title", "").lower()

            # 1. Section relevance boost
            if section in preferred_sections:
                score += 0.15

            # 2. Query words in chunk text (lexical coverage)
            if query_words:
                matching_words = sum(1 for w in query_words if w in text)
                overlap_ratio = matching_words / len(query_words)
                score += overlap_ratio * 0.20

            # 3. Paper title query term overlap
            title_matches = sum(1 for w in query_words if w in title)
            if title_matches > 0:
                score += 0.05

            updated_item = dict(item)
            updated_item["score"] = round(min(1.0, score), 4)
            reranked.append(updated_item)

        # Sort descending by updated score
        reranked.sort(key=lambda x: x["score"], reverse=True)
        return reranked[:top_k]


# Global singleton instance
reranker = ContextualReranker()
