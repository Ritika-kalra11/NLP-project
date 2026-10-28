"""
Timeline API Router.
Retrieves evolutionary research milestones sorted by publication years.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.timeline_service import TimelineService

router = APIRouter(prefix="/timeline", tags=["Timeline"])


@router.get("", response_model=List[Dict[str, Any]])
def get_timeline(
    topic: Optional[str] = Query(None, description="Filter timeline by topic"),
    db: Session = Depends(get_db)
):
    """
    Returns research paper milestones organized chronologically by publication year.
    """
    timeline_data = TimelineService.get_timeline(db, topic_filter=topic)
    return timeline_data
