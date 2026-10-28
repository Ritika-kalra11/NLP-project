"""
Research Gaps API Router.
Analyzes indexed literature to uncover underexplored areas, missing benchmarks, and methodological gaps.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.research_gap import ResearchGapsResponse
from app.services.gap_analyzer import ResearchGapAnalyzer

router = APIRouter(prefix="/research-gaps", tags=["Research Gaps"])


@router.get("", response_model=ResearchGapsResponse)
@router.post("", response_model=ResearchGapsResponse)
def get_research_gaps(db: Session = Depends(get_db)):
    """
    Synthesizes common themes, methodologies, and limitations across papers to uncover
    grounded research gaps with verified evidence coverage.
    """
    response = ResearchGapAnalyzer.analyze_gaps(db)
    return response
