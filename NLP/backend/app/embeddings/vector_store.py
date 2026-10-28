"""
Persistent FAISS vector store with metadata mapping and cosine similarity search.
"""

import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import faiss
import numpy as np

from app.config import settings

logger = logging.getLogger(__name__)


class FAISSVectorStore:
    """Manages dense vector indexing and metadata retrieval using FAISS IndexFlatIP."""

    def __init__(self, storage_dir: Optional[str] = None):
        self.storage_dir = Path(storage_dir or settings.VECTOR_DB_DIR)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.index_path = self.storage_dir / "faiss_index.bin"
        self.metadata_path = self.storage_dir / "chunks_metadata.json"

        self.dimension = 384
        self.index: Optional[faiss.IndexFlatIP] = None
        self.metadata_list: List[Dict[str, Any]] = []

        self._load_or_create_index()

    def _load_or_create_index(self):
        """Loads existing index and metadata from disk, or initializes an empty index."""
        if self.index_path.exists() and self.metadata_path.exists():
            try:
                self.index = faiss.read_index(str(self.index_path))
                self.dimension = self.index.d
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.metadata_list = json.load(f)
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors and {len(self.metadata_list)} metadata records.")
                return
            except Exception as e:
                logger.error(f"Failed to load existing FAISS index: {e}. Reinitializing.")

        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata_list = []
        logger.info(f"Initialized new FAISS IndexFlatIP with dimension {self.dimension}.")

    def save(self):
        """Persists the FAISS index and chunk metadata list to disk."""
        if self.index is not None:
            faiss.write_index(self.index, str(self.index_path))
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata_list, f, ensure_ascii=False, indent=2)

    def add_chunks(self, chunks: List[Dict[str, Any]], embeddings: np.ndarray) -> List[int]:
        """
        Adds vectors and corresponding metadata records to the vector index.
        Returns the assigned FAISS integer IDs.
        """
        if len(chunks) == 0:
            return []

        num_vectors, dim = embeddings.shape

        # Reinitialize index if dimension mismatch occurs
        if self.index is None or self.index.d != dim:
            logger.info(f"Adjusting FAISS index dimension from {self.dimension} to {dim}.")
            self.dimension = dim
            self.index = faiss.IndexFlatIP(dim)
            self.metadata_list = []

        start_id = self.index.ntotal
        self.index.add(embeddings)

        assigned_ids = []
        for i, meta in enumerate(chunks):
            vector_id = start_id + i
            meta_record = {
                "vector_id": vector_id,
                "chunk_id": meta.get("id"),
                "paper_id": meta.get("paper_id"),
                "paper_title": meta.get("paper_title", "Research Paper"),
                "authors": meta.get("authors", ""),
                "publication_year": meta.get("publication_year"),
                "page_number": meta.get("page_number", 1),
                "section_name": meta.get("section_name", "Body"),
                "chunk_index": meta.get("chunk_index", 0),
                "text": meta.get("text", ""),
                "token_count": meta.get("token_count", 0),
            }
            self.metadata_list.append(meta_record)
            assigned_ids.append(vector_id)

        self.save()
        return assigned_ids

    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 5,
        paper_id: Optional[int] = None,
        similarity_threshold: float = 0.20
    ) -> List[Dict[str, Any]]:
        """
        Executes cosine similarity search over indexed chunks with optional paper_id filtering.
        """
        if self.index is None or self.index.ntotal == 0:
            return []

        # Ensure query vector is shape (1, dim)
        if query_vector.ndim == 1:
            query_vector = np.expand_dims(query_vector, axis=0)

        # Retrieve a wider pool to allow for post-filtering
        search_k = min(self.index.ntotal, max(top_k * 4, 20))
        scores, indices = self.index.search(query_vector, search_k)

        raw_scores = scores[0]
        raw_indices = indices[0]

        filtered_results = []
        for score, idx in zip(raw_scores, raw_indices):
            if idx == -1 or idx >= len(self.metadata_list):
                continue

            meta = self.metadata_list[idx]

            # Paper ID filter
            if paper_id is not None and meta.get("paper_id") != paper_id:
                continue

            # Similarity threshold check
            cosine_score = float(score)
            if cosine_score < similarity_threshold:
                continue

            result_entry = dict(meta)
            result_entry["score"] = round(cosine_score, 4)
            filtered_results.append(result_entry)

            if len(filtered_results) >= top_k:
                break

        return filtered_results

    def delete_paper(self, paper_id: int):
        """
        Removes all chunks associated with a specific paper and rebuilds the FAISS index.
        """
        if not self.metadata_list:
            return

        remaining_metadata = [m for m in self.metadata_list if m.get("paper_id") != paper_id]

        if len(remaining_metadata) == len(self.metadata_list):
            return  # No chunks for this paper

        # If all chunks deleted, reset index
        if not remaining_metadata:
            self.index = faiss.IndexFlatIP(self.dimension)
            self.metadata_list = []
            self.save()
            return

        # Rebuilding index from remaining chunks
        logger.info(f"Rebuilding vector index after deleting paper {paper_id}...")
        from app.embeddings.embedding_service import embedding_service
        texts = [m["text"] for m in remaining_metadata]
        new_embeddings = embedding_service.embed_texts(texts)

        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata_list = []
        self.add_chunks(remaining_metadata, new_embeddings)

    def get_all_chunks(self) -> List[Dict[str, Any]]:
        """Returns all indexed chunk metadata."""
        return list(self.metadata_list)

    def count(self) -> int:
        """Returns the total number of indexed vectors."""
        return self.index.ntotal if self.index is not None else 0


# Global singleton instance
vector_store = FAISSVectorStore()
