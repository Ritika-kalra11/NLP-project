"""
Central API Router uniting all endpoint modules.
"""

from fastapi import APIRouter
from app.api.papers import router as papers_router
from app.api.chat import router as chat_router
from app.api.search import router as search_router
from app.api.compare import router as compare_router
from app.api.research_gaps import router as research_gaps_router
from app.api.topics import router as topics_router
from app.api.knowledge_graph import router as knowledge_graph_router
from app.api.timeline import router as timeline_router
from app.api.conversations import router as conversations_router
from app.api.evaluation import router as evaluation_router
from app.api.stats import router as stats_router
from app.api.export import router as export_router
from app.api.citations import router as citations_router

api_router = APIRouter(prefix="/api")

api_router.include_router(papers_router)
api_router.include_router(chat_router)
api_router.include_router(search_router)
api_router.include_router(compare_router)
api_router.include_router(research_gaps_router)
api_router.include_router(topics_router)
api_router.include_router(knowledge_graph_router)
api_router.include_router(timeline_router)
api_router.include_router(conversations_router)
api_router.include_router(evaluation_router)
api_router.include_router(stats_router)
api_router.include_router(export_router)
api_router.include_router(citations_router)
