"""
Comparison & Consistency API Router.
Generates multi-paper comparative matrices and evaluates scientific consensus/contradictions.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.comparison import CompareRequest, ComparisonResponse, ConsistencyRequest, ConsistencyResponse
from app.services.comparator import PaperComparator
from app.services.consistency_analyzer import ConsistencyAnalyzer

router = APIRouter(prefix="/compare", tags=["Comparison"])


@router.post("", response_model=ComparisonResponse)
def compare_papers(
    request: CompareRequest,
    db: Session = Depends(get_db)
):
    """
    Generates a structured, grounded comparison matrix across multiple selected research papers.
    """
    if len(request.paper_ids) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 papers for comparison.")

    try:
        response = PaperComparator.compare_papers(request.paper_ids, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/consistency", response_model=ConsistencyResponse)
def check_paper_consistency(
    request: ConsistencyRequest,
    db: Session = Depends(get_db)
):
    """
    Analyzes whether selected papers agree, disagree, or diverge due to different experimental conditions.
    """
    if len(request.paper_ids) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 papers for consistency analysis.")

    try:
        response = ConsistencyAnalyzer.analyze_consistency(
            paper_ids=request.paper_ids,
            topic_or_claim=request.topic_or_claim,
            db=db
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
