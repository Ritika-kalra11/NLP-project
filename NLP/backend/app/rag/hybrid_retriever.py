"""
Hybrid Retriever combining FAISS Dense Semantic Search and BM25 Sparse Lexical Retrieval
via Reciprocal Rank Fusion (RRF).
"""

from typing import List, Dict, Any, Optional
import numpy as np

from app.embeddings.embedding_service import embedding_service
from app.embeddings.vector_store import vector_store
from app.rag.bm25_retriever import bm25_retriever


class HybridRetriever:
    """Orchestrates multi-modal retrieval over scientific paper chunks."""

    def __init__(self, rrf_k: int = 60, dense_weight: float = 0.65, sparse_weight: float = 0.35):
        self.rrf_k = rrf_k
        self.dense_weight = dense_weight
        self.sparse_weight = sparse_weight

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        paper_id: Optional[int] = None,
        similarity_threshold: float = 0.20,
        mode: str = "hybrid"
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top candidate chunks using 'dense', 'keyword', or 'hybrid' strategy.
        """
        # Ensure BM25 has latest chunks
        if bm25_retriever.bm25 is None and vector_store.count() > 0:
            bm25_retriever.update_corpus(vector_store.get_all_chunks())

        # 1. Mode: Pure Keyword / BM25
        if mode == "keyword":
            results = bm25_retriever.search(query=query, top_k=top_k, paper_id=paper_id)
            for r in results:
                r["retrieval_source"] = "bm25"
            return results

        # 2. Mode: Pure Dense Semantic
        query_vector = embedding_service.embed_query(query)
        dense_results = vector_store.search(
            query_vector=query_vector,
            top_k=top_k * 2,
            paper_id=paper_id,
            similarity_threshold=similarity_threshold
        )
        for r in dense_results:
            r["retrieval_source"] = "dense"

        if mode == "semantic":
            return dense_results[:top_k]

        # 3. Mode: Hybrid (Dense + BM25 via Reciprocal Rank Fusion)
        bm25_results = bm25_retriever.search(query=query, top_k=top_k * 2, paper_id=paper_id)

        # Merge candidate pools
        chunk_map: Dict[str, Dict[str, Any]] = {}
        rrf_scores: Dict[str, float] = {}
        dense_scores: Dict[str, float] = {}
        has_bm25_match: Dict[str, bool] = {}

        # Process dense ranking
        for rank, item in enumerate(dense_results):
            key = f"{item['paper_id']}_{item.get('chunk_index', 0)}"
            chunk_map[key] = item
            dense_scores[key] = float(item.get("score", 0.0))
            rrf_dense = 1.0 / (self.rrf_k + (rank + 1))
            rrf_scores[key] = rrf_scores.get(key, 0.0) + (self.dense_weight * rrf_dense)

        # Process sparse ranking
        for rank, item in enumerate(bm25_results):
            key = f"{item['paper_id']}_{item.get('chunk_index', 0)}"
            if key not in chunk_map:
                chunk_map[key] = item
            has_bm25_match[key] = True
            rrf_sparse = 1.0 / (self.rrf_k + (rank + 1))
            rrf_scores[key] = rrf_scores.get(key, 0.0) + (self.sparse_weight * rrf_sparse)

        if not rrf_scores:
            return []

        # Check if any candidate has meaningful query overlap or meets similarity threshold
        hybrid_list = []
        for key, rrf_score in rrf_scores.items():
            chunk_data = dict(chunk_map[key])
            d_score = dense_scores.get(key, 0.0)
            b_matched = has_bm25_match.get(key, False)

            # If no keyword match and dense score is below similarity threshold, discard
            if not b_matched and d_score < similarity_threshold:
                continue

            chunk_data["score"] = round(d_score if d_score > 0 else 0.35, 4)
            chunk_data["retrieval_source"] = "hybrid" if b_matched and d_score > 0 else ("bm25" if b_matched else "dense")
            hybrid_list.append(chunk_data)

        # Sort descending by score
        hybrid_list.sort(key=lambda x: x["score"], reverse=True)
        return hybrid_list[:top_k]


# Global singleton instance
hybrid_retriever = HybridRetriever()
