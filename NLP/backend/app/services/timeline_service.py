"""
Research Timeline Service.
Constructs chronological research milestones grouped by publication years, methods, and topics.
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.paper import Paper


class TimelineService:
    """Organizes papers and algorithmic milestones chronologically."""

    @classmethod
    def get_timeline(cls, db: Session, topic_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves papers sorted by publication year and generates evolutionary timeline steps.
        """
        query = db.query(Paper)
        papers = query.all()

        if not papers:
            return []

        # Group by year
        year_groups = defaultdict(list)
        for p in papers:
            year = p.publication_year or 2024
            year_groups[year].append(p)

        timeline_entries = []

        for year in sorted(year_groups.keys()):
            year_papers = year_groups[year]

            paper_items = []
            distinct_methods = set()
            distinct_developments = []

            for p in year_papers:
                paper_items.append({
                    "id": p.id,
                    "title": p.title,
                    "authors": p.authors,
                    "page_count": p.page_count,
                    "abstract_preview": (p.abstract or "")[:180] + "...",
                    "status": p.status
                })

                if "sparse" in p.title.lower() or "attention" in p.title.lower():
                    distinct_methods.add("Sparse & Linear Attention Mechanisms")
                    distinct_developments.append("Quadratic complexity reduction for multi-page scientific texts")
                elif "rag" in p.title.lower() or "retrieval" in p.title.lower():
                    distinct_methods.add("Hybrid BM25 + Dense RRF Retrieval")
                    distinct_developments.append("Deterministic source attribution and hallucination mitigation")
                elif "generalization" in p.title.lower() or "benchmark" in p.title.lower():
                    distinct_methods.add("Cross-Domain Zero-Shot Evaluation")
                    distinct_developments.append("Standardization of multi-disciplinary scientific transfer benchmarks")
                else:
                    distinct_methods.add("Transformer Representation Learning")
                    distinct_developments.append("Deep contextualized semantic embedding")

            timeline_entries.append({
                "year": year,
                "papers_count": len(year_papers),
                "papers": paper_items,
                "key_methods": list(distinct_methods),
                "research_developments": list(set(distinct_developments)),
                "summary": f"In {year}, literature prioritized {', '.join(list(distinct_methods)[:2])} to advance foundational scientific NLP capabilities."
            })

        return timeline_entries
