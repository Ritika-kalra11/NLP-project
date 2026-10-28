"""
Topic Discovery and Mapping Service.
Extracts major research topics across papers and links topics to papers and key passages.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.paper import Paper
from app.models.chunk import PaperChunk
from app.models.topic import Topic


class TopicService:
    """Discovers research themes and aggregates topic-to-passage provenance."""

    TOPIC_DEFINITIONS = [
        {
            "name": "Transformer Architectures",
            "keywords": ["transformer", "attention", "multi-head", "sparse", "bert", "gpt", "scaling"],
            "description": "Exploration of self-attention mechanisms and transformer variants for sequential data."
        },
        {
            "name": "Retrieval-Augmented Generation (RAG)",
            "keywords": ["rag", "retrieval", "vector", "embedding", "bm25", "hybrid", "grounding"],
            "description": "Techniques for combining parametric language models with non-parametric external knowledge retrieval."
        },
        {
            "name": "Citation Grounding & Hallucination Mitigation",
            "keywords": ["hallucination", "citation", "faithfulness", "provenance", "verifiable", "source"],
            "description": "Methods to eliminate factual fabrications and enforce rigorous source document attribution."
        },
        {
            "name": "Scientific NLP & Document Understanding",
            "keywords": ["scientific", "academic", "pdf", "section", "abstract", "literature", "scidocs"],
            "description": "Parsing, structuring, and extracting insights from dense academic publications."
        },
        {
            "name": "Cross-Domain Generalization & Benchmarking",
            "keywords": ["generalization", "benchmark", "domain", "evaluation", "transfer", "ood"],
            "description": "Measuring model robustness and error modes under out-of-distribution domain shifts."
        }
    ]

    @classmethod
    def discover_and_link_topics(cls, db: Session) -> List[Dict[str, Any]]:
        """
        Scans all papers, updates topic counts in DB, and returns topic trees with linked papers and passages.
        """
        papers = db.query(Paper).all()
        topic_results = []

        for topic_def in cls.TOPIC_DEFINITIONS:
            t_name = topic_def["name"]
            t_desc = topic_def["description"]
            keywords = topic_def["keywords"]

            # Find matching papers
            matching_papers = []
            for paper in papers:
                p_text = f"{paper.title} {paper.abstract or ''}".lower()
                # Check paper-level match
                score = sum(1 for kw in keywords if kw in p_text)
                if score > 0:
                    # Find relevant passages for this topic in the paper
                    chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == paper.id).all()
                    relevant_chunks = []
                    for chunk in chunks:
                        c_text = chunk.text.lower()
                        c_matches = sum(1 for kw in keywords if kw in c_text)
                        if c_matches > 0:
                            relevant_chunks.append({
                                "chunk_id": chunk.id,
                                "page_number": chunk.page_number,
                                "section_name": chunk.section_name,
                                "snippet": chunk.text[:220] + "..."
                            })

                    matching_papers.append({
                        "paper_id": paper.id,
                        "title": paper.title,
                        "authors": paper.authors,
                        "year": paper.publication_year,
                        "page_count": paper.page_count,
                        "passages": relevant_chunks[:3]  # top 3 representative passages
                    })

            # Sync or create topic record in database
            db_topic = db.query(Topic).filter(Topic.name == t_name).first()
            if not db_topic:
                db_topic = Topic(name=t_name, description=t_desc, paper_count=len(matching_papers))
                db.add(db_topic)
            else:
                db_topic.paper_count = len(matching_papers)
            db.commit()

            topic_results.append({
                "id": db_topic.id,
                "name": t_name,
                "description": t_desc,
                "paper_count": len(matching_papers),
                "papers": matching_papers
            })

        return topic_results
