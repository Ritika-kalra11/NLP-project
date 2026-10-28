"""
Services package initialization.
"""

from app.services.llm_service import llm_service, LLMService
from app.services.paper_service import PaperService
from app.services.summarizer import PaperSummarizer
from app.services.comparator import PaperComparator
from app.services.gap_analyzer import ResearchGapAnalyzer
from app.services.consistency_analyzer import ConsistencyAnalyzer
from app.services.knowledge_graph import KnowledgeGraphService
from app.services.topic_service import TopicService
from app.services.timeline_service import TimelineService
from app.services.evaluation_service import EvaluationService
from app.services.demo_data_loader import DemoDataLoader

__all__ = [
    "llm_service",
    "LLMService",
    "PaperService",
    "PaperSummarizer",
    "PaperComparator",
    "ResearchGapAnalyzer",
    "ConsistencyAnalyzer",
    "KnowledgeGraphService",
    "TopicService",
    "TimelineService",
    "EvaluationService",
    "DemoDataLoader",
]
