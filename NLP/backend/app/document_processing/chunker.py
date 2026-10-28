"""
Intelligent, structure-aware, and page-aware text chunking.
Preserves paragraph continuity, respects academic section boundaries, and retains precise page provenance.
"""

import re
from typing import List, Dict, Any


class IntelligentChunker:
    """Chunks research documents while preserving section headers, page numbers, and semantic cohesion."""

    def __init__(self, target_chunk_size: int = 600, overlap_size: int = 100):
        self.target_chunk_size = target_chunk_size
        self.overlap_size = overlap_size

    def chunk_document(self, extracted_doc: Dict[str, Any], paper_id: int) -> List[Dict[str, Any]]:
        """
        Processes extracted document pages and outputs structured chunks.
        """
        chunks: List[Dict[str, Any]] = []
        chunk_counter = 0

        pages = extracted_doc.get("pages", [])

        for page in pages:
            page_num = page.get("page_number", 1)
            blocks = page.get("blocks", [])

            if not blocks:
                # Fallback to plain text if blocks missing
                plain_text = page.get("text", "")
                if plain_text.strip():
                    page_chunks = self._chunk_plain_text(
                        text=plain_text,
                        paper_id=paper_id,
                        page_num=page_num,
                        section_name="Body",
                        start_idx=chunk_counter
                    )
                    chunks.extend(page_chunks)
                    chunk_counter += len(page_chunks)
                continue

            # Group contiguous blocks with the same section on this page
            current_section = blocks[0].get("section", "Introduction")
            section_text_accumulator = []

            for block in blocks:
                block_section = block.get("section", current_section)
                block_text = block.get("text", "").strip()

                if not block_text:
                    continue

                if block_section != current_section and section_text_accumulator:
                    # Flush accumulated text for the previous section
                    full_sec_text = "\n\n".join(section_text_accumulator)
                    sub_chunks = self._chunk_plain_text(
                        text=full_sec_text,
                        paper_id=paper_id,
                        page_num=page_num,
                        section_name=current_section,
                        start_idx=chunk_counter
                    )
                    chunks.extend(sub_chunks)
                    chunk_counter += len(sub_chunks)
                    section_text_accumulator = [block_text]
                    current_section = block_section
                else:
                    section_text_accumulator.append(block_text)

            # Flush remaining section text on this page
            if section_text_accumulator:
                full_sec_text = "\n\n".join(section_text_accumulator)
                sub_chunks = self._chunk_plain_text(
                    text=full_sec_text,
                    paper_id=paper_id,
                    page_num=page_num,
                    section_name=current_section,
                    start_idx=chunk_counter
                )
                chunks.extend(sub_chunks)
                chunk_counter += len(sub_chunks)

        return chunks

    def _chunk_plain_text(
        self,
        text: str,
        paper_id: int,
        page_num: int,
        section_name: str,
        start_idx: int
    ) -> List[Dict[str, Any]]:
        """Splits section text into coherent paragraphs and sentences."""
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        if not paragraphs:
            return []

        result_chunks = []
        current_chunk_text = ""
        current_idx = start_idx

        for para in paragraphs:
            # If paragraph fits comfortably in the current chunk
            if len(current_chunk_text) + len(para) <= self.target_chunk_size:
                if current_chunk_text:
                    current_chunk_text += "\n\n" + para
                else:
                    current_chunk_text = para
            else:
                # If current chunk has text, save it
                if current_chunk_text:
                    token_count = max(1, int(len(current_chunk_text.split()) * 1.3))
                    result_chunks.append({
                        "paper_id": paper_id,
                        "chunk_index": current_idx,
                        "page_number": page_num,
                        "section_name": section_name,
                        "text": current_chunk_text.strip(),
                        "token_count": token_count
                    })
                    current_idx += 1

                    # Create overlap from end of last chunk
                    overlap_snippet = self._extract_overlap(current_chunk_text, self.overlap_size)
                    current_chunk_text = overlap_snippet

                # If paragraph itself is longer than target chunk size, split by sentences
                if len(para) > self.target_chunk_size:
                    sentences = re.split(r'(?<=[.!?])\s+', para)
                    for sent in sentences:
                        sent = sent.strip()
                        if not sent:
                            continue
                        if len(current_chunk_text) + len(sent) <= self.target_chunk_size:
                            if current_chunk_text:
                                current_chunk_text += " " + sent
                            else:
                                current_chunk_text = sent
                        else:
                            if current_chunk_text:
                                token_count = max(1, int(len(current_chunk_text.split()) * 1.3))
                                result_chunks.append({
                                    "paper_id": paper_id,
                                    "chunk_index": current_idx,
                                    "page_number": page_num,
                                    "section_name": section_name,
                                    "text": current_chunk_text.strip(),
                                    "token_count": token_count
                                })
                                current_idx += 1
                                overlap_snippet = self._extract_overlap(current_chunk_text, self.overlap_size)
                                current_chunk_text = (overlap_snippet + " " + sent).strip()
                            else:
                                current_chunk_text = sent
                else:
                    if current_chunk_text:
                        current_chunk_text += "\n\n" + para
                    else:
                        current_chunk_text = para

        # Flush any remaining text
        if current_chunk_text.strip():
            token_count = max(1, int(len(current_chunk_text.split()) * 1.3))
            result_chunks.append({
                "paper_id": paper_id,
                "chunk_index": current_idx,
                "page_number": page_num,
                "section_name": section_name,
                "text": current_chunk_text.strip(),
                "token_count": token_count
            })

        return result_chunks

    def _extract_overlap(self, text: str, overlap_size: int) -> str:
        """Extracts the last N characters aligned to word boundaries for smooth continuity."""
        if len(text) <= overlap_size:
            return text
        tail = text[-overlap_size:]
        first_space = tail.find(" ")
        if first_space != -1 and first_space < len(tail) - 5:
            return tail[first_space + 1:].strip()
        return tail.strip()
