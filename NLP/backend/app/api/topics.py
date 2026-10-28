"""
Topics API Router.
Retrieves discovered research topics with linked papers and representative passages.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.topic_service import TopicService

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get("", response_model=List[Dict[str, Any]])
def get_topics(db: Session = Depends(get_db)):
    """
    Returns discovered research topics with paper mappings and source passages.
    """
    topics = TopicService.discover_and_link_topics(db)
    return topics
