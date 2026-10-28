"""
Embedding and vector database exports.
"""

from app.embeddings.embedding_service import embedding_service, EmbeddingService
from app.embeddings.vector_store import vector_store, FAISSVectorStore

__all__ = [
    "embedding_service",
    "EmbeddingService",
    "vector_store",
    "FAISSVectorStore",
]
