"""
BM25 Keyword Retriever for sparse lexical matching across paper chunks.
"""

import re
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi


class BM25Retriever:
    """Manages an in-memory BM25 index over all document chunks."""

    def __init__(self):
        self.bm25: Optional[BM25Okapi] = None
        self.corpus_chunks: List[Dict[str, Any]] = []

    STOPWORDS = {
        "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "which",
        "this", "that", "these", "those", "then", "just", "so", "than", "such", "both",
        "through", "about", "for", "is", "of", "while", "during", "to", "from", "in",
        "out", "on", "off", "again", "further", "then", "once", "here", "there", "when",
        "where", "why", "how", "all", "any", "both", "each", "few", "more", "most",
        "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
        "too", "very", "can", "will", "just", "should", "now", "are", "was", "were",
        "be", "been", "being", "have", "has", "had", "having", "do", "does", "did",
        "doing", "would", "could", "with", "at", "by", "into"
    }

    def _tokenize(self, text: str) -> List[str]:
        """Lowercases, extracts words, and filters out common stopwords."""
        words = re.findall(r'\b[a-zA-Z0-9_\-]{2,}\b', text.lower())
        filtered = [w for w in words if w not in self.STOPWORDS]
        return filtered if filtered else words

    def update_corpus(self, chunks: List[Dict[str, Any]]):
        """Re-indexes the corpus of chunks."""
        self.corpus_chunks = list(chunks)
        if not self.corpus_chunks:
            self.bm25 = None
            return

        tokenized_corpus = [self._tokenize(chunk.get("text", "")) for chunk in self.corpus_chunks]
        self.bm25 = BM25Okapi(tokenized_corpus)

    def search(
        self,
        query: str,
        top_k: int = 10,
        paper_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes BM25 search and returns matching chunks with normalized scores.
        """
        if self.bm25 is None or not self.corpus_chunks:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scores = self.bm25.get_scores(query_tokens)
        max_score = max(scores) if len(scores) > 0 and max(scores) > 0 else 1.0

        scored_results = []
        for idx, score in enumerate(scores):
            chunk = self.corpus_chunks[idx]

            # Paper ID filter
            if paper_id is not None and chunk.get("paper_id") != paper_id:
                continue

            if score > 0:
                normalized_score = float(score / max_score)
                item = dict(chunk)
                item["score"] = round(normalized_score, 4)
                item["retrieval_source"] = "bm25"
                scored_results.append(item)

        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return scored_results[:top_k]


# Global singleton instance
bm25_retriever = BM25Retriever()
