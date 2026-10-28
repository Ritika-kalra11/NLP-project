# ResearchAI – AI Research Paper Companion
### Advanced Multi-Document NLP & Retrieval-Augmented Generation (RAG) System

ResearchAI is a production-grade, full-stack scientific research companion built for graduate students, ML researchers, and academic institutions. Rather than functioning as a generic conversational chatbot or basic text classifier, ResearchAI implements an end-to-end, structure-aware NLP and RAG pipeline. It ingests complex scientific PDF manuscripts, performs page-aware layout extraction and semantic chunking, constructs dense FAISS and sparse BM25 indices, executes hybrid Reciprocal Rank Fusion (RRF) retrieval, and synthesizes verifiable academic answers with **exact page and section-level source citations**.

---

## 🌟 Key Highlights & System Capabilities

- **Structure-Aware Intelligent Chunking**: Replaces naive character-splitting with academic section awareness (Abstract, Methodology, Experiments, Results, Discussion, Limitations).
- **Zero-Hallucination Citation Grounding**: Every answer is grounded in retrieved PDF passages. If sufficient literature evidence does not exist, the system triggers a strict refusal protocol: *"I could not find sufficient evidence in the uploaded papers to answer this question."*
- **Page-Aware PDF Document Viewer**: Click any citation tag like `[1] Smith et al., Page 4` to instantly open the interactive viewer at that exact page with highlighted evidence.
- **Multi-Paper Grounded Comparison**: Automatically extracts comparative matrices across Research Problem, Datasets, Methodology, Model Architectures, Metrics, Results, and Stated Limitations.
- **Contradiction & Consistency Auditing**: Analyzes whether findings across papers genuinely conflict or merely diverge due to distinct benchmark conditions or dataset shifts.
- **Literature Research Gap Discovery**: Automatically synthesizes overarching themes, common methodologies, and underexplored areas backed by literature quotes with High/Medium/Low evidence coverage ratings.
- **Interactive Knowledge Graph**: Maps relationships between Authors, Papers, Models, Datasets, Tasks, and Domains using interactive SVG node-link visualizations.
- **Chronological Research Timeline**: Visualizes how methods, datasets, and accuracy benchmarks have evolved over publication years.
- **RAG Quality Evaluation Benchmark**: Developer suite computing empirical Precision@K, Recall@K, Answer Faithfulness, Citation Coverage, and Latency benchmarks with visual chart telemetries.
- **Out-of-the-Box Demo Mode**: Pre-seeded with 3 comprehensive research papers and deterministic neural synthesis, allowing immediate viva evaluation without requiring external paid API keys.

---

## 🏗️ System Architecture

```
                                  [ User / Researcher ]
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
        [ React 18 + Vite Frontend ]                 [ FastAPI Python Backend ]
     (Tailwind CSS, Lucide, Recharts)                             │
                     │                                             ▼
                     │                                    [ Document Pipeline ]
                     │                              PyMuPDF / TextCleaner / Chunker
                     │                                             │
                     ▼                                             ▼
            [ REST API Layer ] ───────────────►        [ Embedding & Indexing ]
        /api/chat, /api/papers,                  Dense FAISS Index + In-Memory BM25
        /api/search, /api/compare                                  │
                     │                                             ▼
                     │                                     [ Hybrid RAG Engine ]
                     │                             RRF (Dense + BM25) + Reranking
                     │                                             │
                     ▼                                             ▼
          [ Citation Verifier ] ◄───────────────   [ Grounded Synthesis Engine ]
        Maps [X] to PDF Page & Chunk                  (OpenAI / Groq / Demo Engine)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic Settings, SQLAlchemy ORM |
| **NLP & Vectors** | PyMuPDF (fitz), FAISS, Rank-BM25, Sentence-Transformers, OpenAI SDK |
| **Database** | SQLite with Foreign Key Pragmas |
| **Deployment** | Docker, Docker Compose, NGINX |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Python 3.10+ (Python 3.11 recommended)
- Node.js v18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*The backend will automatically create SQLite tables, generate 3 sample research papers, index all chunks into FAISS, and start on `http://localhost:8000` (Swagger docs available at `http://localhost:8000/docs`).*

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
*Open your browser and navigate to `http://localhost:5173`.*

---

## 🧪 Running the Test Suite

ResearchAI includes automated test suites covering document processing, RAG grounding, and API endpoints:
```bash
# From the project root directory:
python tests/test_document_processing.py
python tests/test_rag_pipeline.py
python tests/test_api_endpoints.py
```

---

## 🐳 Docker Deployment

To launch the full-stack system with a single command:
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Interactive API Docs: `http://localhost:8000/docs`
