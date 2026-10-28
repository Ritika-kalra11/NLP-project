"""
PyMuPDF-based PDF extraction engine with metadata discovery and OCR fallback detection.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
import fitz  # PyMuPDF

from app.document_processing.text_cleaner import TextCleaner
from app.document_processing.section_detector import SectionDetector


class PDFExtractor:
    """Extracts structured academic text, page boundaries, and metadata from PDF files."""

    @classmethod
    def extract_document(cls, pdf_path: str) -> Dict[str, Any]:
        """
        Extracts document metadata, page text, and section spans.
        Returns a dictionary containing document-level metadata and per-page content.
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found at path: {pdf_path}")

        doc = fitz.open(pdf_path)
        page_count = len(doc)

        metadata = doc.metadata or {}
        extracted_pages: List[Dict[str, Any]] = []
        full_text_accumulator: List[str] = []

        current_detected_section = "Introduction"

        for page_idx in range(page_count):
            page = doc[page_idx]
            page_number = page_idx + 1

            # Extract text blocks
            # block format: (x0, y0, x1, y1, "lines", block_no, block_type)
            blocks = page.get_text("blocks")
            page_text_blocks = []
            page_sections_found = []

            for block in blocks:
                # block[4] contains the text content
                if len(block) > 4 and isinstance(block[4], str):
                    raw_block_text = block[4].strip()
                    if not raw_block_text:
                        continue

                    # Check if block is a section header
                    first_line = raw_block_text.split("\n")[0].strip()
                    header = SectionDetector.identify_section_header(first_line)
                    if header:
                        current_detected_section = header
                        page_sections_found.append(header)

                    cleaned_block = TextCleaner.clean_text(raw_block_text)
                    if cleaned_block:
                        page_text_blocks.append({
                            "text": cleaned_block,
                            "section": current_detected_section,
                            "bbox": (block[0], block[1], block[2], block[3])
                        })

            # Check for scanned page (text is empty or negligible)
            page_plain_text = "\n\n".join([b["text"] for b in page_text_blocks])
            if len(page_plain_text.strip()) < 30:
                # OCR fallback indication
                page_plain_text += f"\n[Note: Page {page_number} contains minimal digital text or scanned imagery]"

            full_text_accumulator.append(page_plain_text)

            extracted_pages.append({
                "page_number": page_number,
                "text": page_plain_text,
                "blocks": page_text_blocks,
                "sections": list(set(page_sections_found)) if page_sections_found else [current_detected_section]
            })

        doc.close()

        # Combine first 2 pages for metadata discovery (title, author, abstract)
        preview_text = "\n\n".join(full_text_accumulator[:2])
        discovered_title = cls._extract_title(preview_text, metadata, pdf_path)
        discovered_authors = cls._extract_authors(preview_text, metadata)
        discovered_year = cls._extract_year(preview_text, metadata)
        discovered_abstract = cls._extract_abstract(preview_text)

        return {
            "title": discovered_title,
            "authors": discovered_authors,
            "publication_year": discovered_year,
            "abstract": discovered_abstract,
            "page_count": page_count,
            "pages": extracted_pages,
            "full_text": "\n\n--- PAGE BREAK ---\n\n".join(full_text_accumulator)
        }

    @classmethod
    def _extract_title(cls, preview_text: str, metadata: Dict[str, Any], file_path: str) -> str:
        """Heuristically extracts paper title from metadata or top text lines."""
        meta_title = (metadata.get("title") or "").strip()
        if meta_title and len(meta_title) > 5 and not meta_title.lower().endswith(".pdf") and "untitled" not in meta_title.lower():
            return meta_title

        # Look for the first non-trivial lines before "Abstract" or "Introduction"
        lines = [line.strip() for line in preview_text.split("\n") if line.strip()]
        candidate_lines = []
        for line in lines[:8]:
            if re.search(r'^(abstract|introduction|ieee|arxiv|springer|proceedings)', line, re.IGNORECASE):
                break
            if len(line) > 3:
                candidate_lines.append(line)

        if candidate_lines:
            # Combine the first 1-2 lines as title
            title_candidate = " ".join(candidate_lines[:2])
            if len(title_candidate) > 8:
                return title_candidate[:250]

        # Fallback to sanitized filename
        base_name = Path(file_path).stem.replace("_", " ").replace("-", " ")
        return base_name.title()[:250]

    @classmethod
    def _extract_authors(cls, preview_text: str, metadata: Dict[str, Any]) -> str:
        """Extracts authors from metadata or first page header."""
        meta_author = (metadata.get("author") or "").strip()
        if meta_author and len(meta_author) > 2 and "unknown" not in meta_author.lower():
            return meta_author[:250]

        # Scan text between title and abstract
        abstract_match = re.search(r'\babstract\b', preview_text, re.IGNORECASE)
        if abstract_match:
            pre_abstract = preview_text[:abstract_match.start()]
            lines = [l.strip() for l in pre_abstract.split("\n") if l.strip()]
            # Usually author names appear around lines 2-4
            if len(lines) >= 2:
                candidate = lines[1]
                if len(candidate) < 120 and not re.search(r'\d', candidate):
                    return candidate

        return "Authors not explicitly indexed"

    @classmethod
    def _extract_year(cls, preview_text: str, metadata: Dict[str, Any]) -> Optional[int]:
        """Extracts publication year from metadata or copyright/arxiv date strings."""
        creation_date = metadata.get("creationDate") or ""
        year_match = re.search(r'(19\d\d|20\d\d)', creation_date)
        if year_match:
            year = int(year_match.group(1))
            if 1950 <= year <= 2030:
                return year

        # Look in the text for "202X" or "199X"
        text_year_matches = re.findall(r'\b(20[0-2][0-9]|199[0-9])\b', preview_text[:2000])
        if text_year_matches:
            return int(text_year_matches[0])

        return 2024

    @classmethod
    def _extract_abstract(cls, preview_text: str) -> Optional[str]:
        """Extracts the paper's abstract section."""
        # Find text between 'Abstract' and '1. Introduction' or 'Introduction'
        pattern = r'(?:abstract|a\s*b\s*s\s*t\s*r\s*a\s*c\s*t)[\s\:\.\-]+(.*?)(?:1\.?\s+introduction|introduction|categories and subject descriptors|keywords|\n\s*\n\s*\n)'
        match = re.search(pattern, preview_text, re.IGNORECASE | re.DOTALL)
        if match:
            abstract_text = match.group(1).strip()
            # Clean up whitespace
            abstract_text = re.sub(r'\s+', ' ', abstract_text)
            if len(abstract_text) > 40:
                return abstract_text[:2500]

        # Fallback: grab first 800 characters of page 1
        cleaned = re.sub(r'\s+', ' ', preview_text[:1200]).strip()
        return cleaned[:800] if len(cleaned) > 100 else "Abstract extraction not available."
