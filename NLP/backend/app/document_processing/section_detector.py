"""
Section detection for scientific research papers.
Identifies standard IMRAD and computer science paper sections.
"""

import re
from typing import Optional, Tuple


class SectionDetector:
    """Detects academic paper section headings from text lines and layout cues."""

    # Canonical section categories
    SECTION_PATTERNS = [
        ("Abstract", r'^(abstract)$'),
        ("Introduction", r'^(1\.?\s+)?(introduction|overview)$'),
        ("Related Work", r'^(\d+\.?\s+)?(related\s+work|background|prior\s+art|literature\s+review)$'),
        ("Methodology", r'^(\d+\.?\s+)?(methodology|methods?|proposed\s+method|architecture|our\s+approach|framework|model\s+formulation)$'),
        ("Dataset", r'^(\d+\.?\s+)?(dataset|datasets|data\s+collection|corpus|benchmark\s+data)$'),
        ("Experiments", r'^(\d+\.?\s+)?(experiments|experimental\s+setup|evaluation\s+setup|implementation\s+details)$'),
        ("Results", r'^(\d+\.?\s+)?(results|empirical\s+results|findings|performance\s+analysis)$'),
        ("Discussion", r'^(\d+\.?\s+)?(discussion|ablation\s+study|qualitative\s+analysis)$'),
        ("Limitations", r'^(\d+\.?\s+)?(limitations|threats\s+to\s+validity|ethical\s+considerations)$'),
        ("Conclusion", r'^(\d+\.?\s+)?(conclusion|concluding\s+remarks|summary\s+and\s+future\s+work|future\s+work)$'),
        ("References", r'^(\d+\.?\s+)?(references|bibliography|citations)$'),
    ]

    @classmethod
    def identify_section_header(cls, line: str) -> Optional[str]:
        """
        Determines if a line is a section header, returning the normalized section name.
        """
        stripped = line.strip()
        if not stripped or len(stripped) > 80:
            return None

        # Check against regex patterns
        clean_header = re.sub(r'^[0-9IVXLCDM]+\.?\s*', '', stripped).strip()

        for canonical_name, pattern in cls.SECTION_PATTERNS:
            if re.search(pattern, stripped, re.IGNORECASE) or re.search(pattern, clean_header, re.IGNORECASE):
                return canonical_name

        # Match generic numbered headings like "3. System Architecture"
        num_match = re.match(r'^(\d+(\.\d+)*)\s+([A-Z][A-Za-z0-9\s\-_]{2,50})$', stripped)
        if num_match:
            heading_title = num_match.group(3).strip()
            # Check if it resembles section name
            for canonical_name, pattern in cls.SECTION_PATTERNS:
                if re.search(pattern, heading_title, re.IGNORECASE):
                    return canonical_name
            return heading_title.title()

        return None
