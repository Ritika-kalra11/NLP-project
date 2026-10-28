"""
Schemas initialization module.
"""

from app.schemas.paper import (
    TopicSchema,
    PaperChunkSchema,
    StructuredSummarySchema,
    PaperResponse,
    PaperDetailResponse,
    ExtractedPageSchema,
    ExtractedTextResponse,
)
from app.schemas.chat import (
    ChatRequest,
    CitationResponse,
    EvidenceChunkSchema,
    WhyThisAnswerSchema,
    MessageResponse,
    ConversationResponse,
)
from app.schemas.search import (
    SearchRequest,
    SearchResultItem,
    SearchResponse,
)
from app.schemas.comparison import (
    CompareRequest,
    PaperAspectDetail,
    ComparisonRow,
    ComparisonResponse,
    ConsistencyRequest,
    ClaimComparison,
    ConsistencyResponse,
)
from app.schemas.research_gap import (
    GapEvidenceItem,
    ResearchGapItem,
    ResearchGapsResponse,
)
from app.schemas.evaluation import (
    EvalTestCase,
    EvalResultItem,
    EvaluationSummaryResponse,
)

__all__ = [
    "TopicSchema",
    "PaperChunkSchema",
    "StructuredSummarySchema",
    "PaperResponse",
    "PaperDetailResponse",
    "ExtractedPageSchema",
    "ExtractedTextResponse",
    "ChatRequest",
    "CitationResponse",
    "EvidenceChunkSchema",
    "WhyThisAnswerSchema",
    "MessageResponse",
    "ConversationResponse",
    "SearchRequest",
    "SearchResultItem",
    "SearchResponse",
    "CompareRequest",
    "PaperAspectDetail",
    "ComparisonRow",
    "ComparisonResponse",
    "ConsistencyRequest",
    "ClaimComparison",
    "ConsistencyResponse",
    "GapEvidenceItem",
    "ResearchGapItem",
    "ResearchGapsResponse",
    "EvalTestCase",
    "EvalResultItem",
    "EvaluationSummaryResponse",
]
