"""
Context Builder for assembling academic prompt contexts with clear chunk metadata.
"""

from typing import List, Dict, Any, Tuple


class ContextBuilder:
    """Formats retrieved chunks into a structured prompt context with citation keys."""

    @classmethod
    def build_context(cls, chunks: List[Dict[str, Any]], max_chars: int = 12000) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Builds a structured context string from retrieved chunks and returns the annotated chunk list.
        """
        if not chunks:
            return "", []

        context_blocks = []
        annotated_chunks = []
        current_chars = 0

        for i, chunk in enumerate(chunks):
            citation_num = i + 1
            paper_title = chunk.get("paper_title", "Research Paper")
            authors = chunk.get("authors", "Unknown")
            year = chunk.get("publication_year", 2024)
            page_num = chunk.get("page_number", 1)
            section = chunk.get("section_name", "Body")
            text = chunk.get("text", "").strip()

            block = (
                f"[Source {citation_num}]\n"
                f"Paper: \"{paper_title}\" ({authors}, {year})\n"
                f"Page: {page_num} | Section: {section}\n"
                f"Excerpt:\n\"{text}\"\n"
            )

            if current_chars + len(block) > max_chars and annotated_chunks:
                break

            context_blocks.append(block)
            current_chars += len(block)

            chunk_meta = dict(chunk)
            chunk_meta["citation_index"] = citation_num
            annotated_chunks.append(chunk_meta)

        full_context = "\n---\n".join(context_blocks)
        return full_context, annotated_chunks
