"""
Evaluation API Router.
Runs empirical benchmarks to evaluate retrieval precision, recall, faithfulness, latency, and grounding.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.evaluation import EvaluationSummaryResponse
from app.services.evaluation_service import EvaluationService

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


@router.get("", response_model=EvaluationSummaryResponse)
@router.post("/run", response_model=EvaluationSummaryResponse)
def run_evaluation_benchmark(db: Session = Depends(get_db)):
    """
    Executes academic question test cases against the live RAG pipeline and returns
    empirical metrics (Precision, Recall, Faithfulness, Citation Coverage, Latency).
    """
    summary = EvaluationService.run_benchmark(db)
    return summary
