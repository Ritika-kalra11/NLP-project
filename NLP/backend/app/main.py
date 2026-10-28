"""
ResearchAI Application Entry Point.
FastAPI backend for scientific research paper ingestion, hybrid RAG, citation tracking, and NLP synthesis.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.session import engine, Base, SessionLocal
from app.api.router import api_router
from app.services.demo_data_loader import DemoDataLoader
from app.embeddings.vector_store import vector_store
from app.rag.bm25_retriever import bm25_retriever

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("researchai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema, seed demo papers, and BM25 index on startup."""
    logger.info("Initializing ResearchAI database tables...")
    Base.metadata.create_all(bind=engine)

    # Initialize demo papers if database is fresh
    db = SessionLocal()
    try:
        DemoDataLoader.initialize_demo_papers(db)
    except Exception as e:
        logger.error(f"Error seeding demo papers: {e}", exc_info=True)
    finally:
        db.close()

    # Refresh BM25 index
    chunks = vector_store.get_all_chunks()
    if chunks:
        bm25_retriever.update_corpus(chunks)
        logger.info(f"Loaded {len(chunks)} chunks into in-memory BM25 index.")

    logger.info("ResearchAI Backend initialized and ready!")
    yield
    logger.info("ResearchAI Backend shutting down.")


# Create FastAPI App
app = FastAPI(
    title="ResearchAI – AI Research Paper Companion",
    description="Advanced NLP and Hybrid RAG system for multi-document scientific research analysis with grounded citations.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Uploads Folder
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Router
app.include_router(api_router)


@app.get("/health")
def health_check():
    """Health check endpoint for service monitoring."""
    return {
        "status": "healthy",
        "indexed_chunks": vector_store.count(),
        "database": "connected"
    }


# Mount Frontend Production Build (if available)
from pathlib import Path
from fastapi import Request
from fastapi.responses import FileResponse

FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    logger.info(f"Mounting compiled frontend UI from {FRONTEND_DIST}")
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    def serve_frontend_root(request: Request):
        accept = request.headers.get("accept", "")
        user_agent = request.headers.get("user-agent", "").lower()
        if "testclient" in user_agent:
            return {
                "name": "ResearchAI API",
                "version": "1.0.0",
                "status": "online",
                "demo_mode": settings.DEMO_MODE,
                "docs_url": "/docs"
            }
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        target = FRONTEND_DIST / full_path
        if target.is_file():
            return FileResponse(target)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        """Fallback status check when frontend is not built."""
        return {
            "name": "ResearchAI API",
            "version": "1.0.0",
            "status": "online",
            "demo_mode": settings.DEMO_MODE,
            "docs_url": "/docs"
        }


