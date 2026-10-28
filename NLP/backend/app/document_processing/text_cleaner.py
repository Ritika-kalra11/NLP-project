"""
Text cleaning utilities for scientific research papers.
Normalizes ligatures, de-hyphenates linebreaks, removes headers/footers, and standardizes whitespace.
"""

import re
import unicodedata
from typing import List


class TextCleaner:
    """Pre-processes and normalizes raw text extracted from PDF documents."""

    # Common unicode ligatures in scientific typesetting
    LIGATURES = {
        "ﬁ": "fi",
        "ﬂ": "fl",
        "ﬀ": "ff",
        "ﬃ": "ffi",
        "ﬄ": "ffl",
        "æ": "ae",
        "œ": "oe",
        "\u00ad": "",  # soft hyphen
    }

    @classmethod
    def clean_text(cls, raw_text: str) -> str:
        """Cleans and standardizes raw text extracted from a PDF page."""
        if not raw_text:
            return ""

        # Normalize unicode (NFKC)
        text = unicodedata.normalize("NFKC", raw_text)

        # Replace ligatures
        for lig, repl in cls.LIGATURES.items():
            text = text.replace(lig, repl)

        # Remove null bytes or non-printable controls
        text = "".join(ch for ch in text if ch == "\n" or ch == "\t" or unicodedata.category(ch)[0] != "C")

        # De-hyphenate words broken across lines: e.g. "trans-\nformer" -> "transformer"
        text = re.sub(r'([a-zA-Z]+)-\s*\n\s*([a-zA-Z]+)', r'\1\2', text)

        # Normalize carriage returns and newlines
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # Strip recurring standalone header/footer page markers e.g. "Page 3 of 12", "arXiv:2301.12345v1 [cs.CL] 15 Jan 2024"
        lines = text.split("\n")
        cleaned_lines = []
        for line in lines:
            line_str = line.strip()
            # Skip standalone page numbers or arxiv stamps at margins
            if re.match(r'^(page\s+\d+(\s+of\s+\d+)?|\d+\s+of\s+\d+|\d+)$', line_str, re.IGNORECASE):
                continue
            if re.match(r'^arxiv:\d+\.\d+v?\d*\s+\[.*?\]\s+\d+\s+\w+\s+\d{4}$', line_str, re.IGNORECASE):
                continue
            cleaned_lines.append(line)

        text = "\n".join(cleaned_lines)

        # Normalize consecutive blank lines to at most two
        text = re.sub(r'\n{3,}', '\n\n', text)

        # Clean spaces while preserving indentation / paragraph breaks
        cleaned_paragraphs = []
        for p in text.split("\n\n"):
            p_clean = re.sub(r'[ \t]+', ' ', p).strip()
            if p_clean:
                cleaned_paragraphs.append(p_clean)

        return "\n\n".join(cleaned_paragraphs)
