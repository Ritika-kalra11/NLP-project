"""
Knowledge Graph API Router.
Generates nodes and edges for scientific entity-relationship exploration.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.knowledge_graph import KnowledgeGraphService

router = APIRouter(prefix="/knowledge-graph", tags=["Knowledge Graph"])


@router.get("", response_model=Dict[str, Any])
def get_knowledge_graph(db: Session = Depends(get_db)):
    """
    Returns nodes (papers, authors, models, datasets, tasks) and semantic links for graph visualization.
    """
    graph_data = KnowledgeGraphService.generate_graph(db)
    return graph_data
