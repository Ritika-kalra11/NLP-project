"""
Unit tests for Document Processing: PDF Extraction, Cleaning, Section Detection, and Chunking.
"""

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.document_processing.text_cleaner import TextCleaner
from app.document_processing.section_detector import SectionDetector
from app.document_processing.chunker import IntelligentChunker


def test_text_cleaner_ligatures_and_hyphens():
    raw = "The trans-\nformer architecture exhibits ﬁne-grained attention on long docu-\nments."
    cleaned = TextCleaner.clean_text(raw)
    assert "transformer" in cleaned
    assert "documents" in cleaned
    assert "fine-grained" in cleaned


def test_section_detector_standard_headers():
    assert SectionDetector.identify_section_header("Abstract") == "Abstract"
    assert SectionDetector.identify_section_header("1. Introduction") == "Introduction"
    assert SectionDetector.identify_section_header("3. Methodology") == "Methodology"
    assert SectionDetector.identify_section_header("4. Experimental Setup") == "Experiments"
    assert SectionDetector.identify_section_header("5. Empirical Results") == "Results"
    assert SectionDetector.identify_section_header("6. Limitations") == "Limitations"
    assert SectionDetector.identify_section_header("7. Conclusion") == "Conclusion"


def test_intelligent_chunker_structure_preservation():
    chunker = IntelligentChunker(target_chunk_size=300, overlap_size=50)
    mock_doc = {
        "pages": [
            {
                "page_number": 1,
                "blocks": [
                    {"text": "This is the first sentence of the abstract. It summarizes the discovery.", "section": "Abstract"},
                    {"text": "1. Introduction begins here. Scientific documents require long context modeling.", "section": "Introduction"}
                ]
            }
        ]
    }
    chunks = chunker.chunk_document(mock_doc, paper_id=99)
    assert len(chunks) >= 2
    assert chunks[0]["page_number"] == 1
    assert chunks[0]["section_name"] == "Abstract"
    assert chunks[1]["section_name"] == "Introduction"


if __name__ == "__main__":
    test_text_cleaner_ligatures_and_hyphens()
    test_section_detector_standard_headers()
    test_intelligent_chunker_structure_preservation()
    print("All document processing tests passed successfully!")
