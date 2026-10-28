# ResearchAI – AI Research Paper Companion
## Comprehensive Academic Project Report & Specification

**Degree / Course:** Master of Computer Applications (MCA) / M.Tech in Artificial Intelligence & Machine Learning  
**Project Title:** ResearchAI – An Explainable, Grounded Multi-Document NLP and Retrieval-Augmented Generation Companion for Scientific Literature Synthesis  
**Project Domain:** Natural Language Processing (NLP), Information Retrieval (IR), Large Language Models (LLMs), Knowledge Representation  

---

## 1. Project Abstract
Scientific literature is expanding exponentially, with hundreds of thousands of research manuscripts published annually across preprint servers and peer-reviewed journals. Graduate students and researchers face cognitive overload when surveying diverse literature, analyzing subtle methodological variations, and pinpointing genuine research gaps. Existing general-purpose conversational LLMs suffer from severe limitations in high-stakes academia: they hallucinate non-existent authors, fabricate citations, conflate experimental findings, and lack fine-grained document provenance.

**ResearchAI** introduces a robust, full-stack, structure-aware NLP and Retrieval-Augmented Generation (RAG) platform. By combining PyMuPDF page-aware extraction, intelligent section detection (IMRAD structure), dense vector similarity search (FAISS IndexFlatIP), sparse lexical matching (BM25Okapi), and Reciprocal Rank Fusion (RRF), ResearchAI provides grounded multi-document question answering. Crucially, every assertion is backed by verifiable citations linking directly to exact PDF pages and sections. Furthermore, the system autonomously extracts multi-paper comparative matrices, audits cross-paper consensus versus experimental discrepancies, discovers literature gaps with evidence coverage ratings, and models entity interactions through an interactive Knowledge Graph.

---

## 2. Problem Statement
Current methods for literature review and paper analysis exhibit several fundamental shortcomings:
1. **Hallucination & Provenance Vacuum**: Commercial LLMs produce plausible-sounding claims without verifiable citations, making them unusable for rigorous academic literature reviews.
2. **Context Window & Quadratic Bottlenecks**: Standard transformer self-attention scales quadratically $O(N^2)$, causing standard models to truncate or drop critical details when processing multi-page documents.
3. **Naive Chunking Degradation**: Conventional RAG systems split text arbitrarily at fixed character lengths (e.g., every 500 characters), bisecting mathematical equations, separating hypotheses from experimental controls, and stripping page numbers.
4. **Lack of Cross-Document Synthesis**: Existing tools answer single questions in isolation but fail to automate multi-paper comparison tables, timeline evolutions, and research gap discovery.

---

## 3. Objectives
The core objectives of the ResearchAI project are:
1. Develop an intelligent document ingestion pipeline that extracts page boundaries, typography, metadata, and academic sections from PDF files.
2. Implement structure-aware semantic chunking that preserves paragraph integrity, section boundaries, and page provenance.
3. Design a Hybrid Information Retrieval architecture combining dense semantic embeddings with sparse BM25 lexical ranking via Reciprocal Rank Fusion (RRF).
4. Enforce strict citation grounding and an automated refusal protocol when literature evidence is insufficient.
5. Create an interactive PDF document viewer allowing users to click citation links (e.g. `[1] Page 4`) and jump directly to the cited page with text highlighting.
6. Provide structured 11-dimension academic paper summaries alongside beginner-friendly analogies.
7. Construct multi-paper comparison matrices and contradiction/consistency auditing modules.
8. Discover evidence-backed research gaps with confidence coverage metrics.
9. Deliver an interactive Knowledge Graph and Chronological Research Timeline.
10. Integrate an empirical RAG evaluation benchmark measuring Precision@K, Recall@K, Faithfulness, and Latency.

---

## 4. Literature Review Outline
- **Vaswani et al. (2017) – "Attention Is All You Need"**: Established multi-head self-attention, replacing recurrent networks but introducing $O(N^2)$ computational complexity bottlenecks on long sequence lengths.
- **Lewis et al. (2020) – "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"**: Pioneered the RAG paradigm, demonstrating that external non-parametric document indices mitigate factual inaccuracies in parametric language models.
- **Robertson et al. (2009) – "The Probabilistic Relevance Framework: BM25 and Beyond"**: Proved the resilience of inverse document frequency (IDF) and term saturation in exact keyword matching.
- **Cormack et al. (2009) – "Reciprocal Rank Fusion (RRF)"**: Formulated rank-based score aggregation, showing that combining disparate retrieval rankings consistently outperforms individual retrieval models without requiring score calibration.
- **Beltagy et al. (2019) – "SciBERT" & Cohan et al. (2020) – "SPECTER"**: Highlighted the critical necessity of domain-specific representations for scientific document parsing.

---

## 5. Proposed Methodology
ResearchAI is formulated across four coordinated processing tiers:

### Tier 1: Document Processing & Extraction
1. **PDF Ingestion & De-duplication**: Documents are uploaded via multi-part streams, validated against size/type constraints, and hashed (SHA-256) to eliminate duplicate indexing.
2. **Text Normalization**: PyMuPDF extracts text blocks and coordinates. Ligatures (e.g., "ﬁ" $\to$ "fi"), hyphenated line breaks, and repeating margin headers are cleaned.
3. **Section Detection**: Regex patterns and layout cues classify text blocks into canonical IMRAD sections (Abstract, Introduction, Related Work, Methodology, Experiments, Results, Discussion, Limitations, Conclusion, References).
4. **Intelligent Chunking**: Sliding-window chunker (600 characters with 100-character overlap) preserves paragraph boundaries and halts at section transitions.

### Tier 2: Indexing & Hybrid Retrieval
1. **Dense Vector Index**: Chunks are embedded into a normalized 384-dimensional dense vector space and indexed via FAISS `IndexFlatIP` (Cosine Similarity).
2. **Sparse In-Memory Index**: Chunks are tokenized (with stopword filtering) into an in-memory `BM25Okapi` index.
3. **Reciprocal Rank Fusion**:
   $$\text{RRF Score}(d) = \frac{w_{\text{dense}}}{k + r_{\text{dense}}(d)} + \frac{w_{\text{sparse}}}{k + r_{\text{sparse}}(d)}$$
   where $k=60$, $w_{\text{dense}}=0.65$, and $w_{\text{sparse}}=0.35$.
4. **Contextual Reranking**: Re-scores top candidates by aligning query intent keywords with section types (e.g., boosting Methodology chunks for architectural queries).

### Tier 3: Grounded Synthesis & Citation Verification
1. **Context Assembly**: Top reranked chunks are formatted with explicit `[Source X]` metadata tags.
2. **Constrained Generation**: LLM synthesis (via OpenAI-compatible API or Grounded Demo Engine) is prompted to assert only claims supported by context and tag each statement with `[X]`.
3. **Provenance Validation**: The Citation Engine verifies that bracketed markers match retrieved chunks, extracts exact 2-sentence evidence snippets, and checks similarity thresholds. If evidence is below $\tau=0.20$, the system returns the grounded refusal: *"I could not find sufficient evidence in the uploaded papers to answer this question."*

### Tier 4: Synthesis & Visualization Modules
1. **11-Dimension Summarization**: Synthesizes One-line summary, Abstract summary, Research problem, Objectives, Methodology, Dataset, Model, Results, Limitations, Future work, Key contributions, and Beginner ELI5 analogies.
2. **Comparative Matrix**: Extracts aspect details across papers.
3. **Gap Discovery**: Cross-references reported limitations with missing metrics to uncover underexplored directions with High/Medium/Low evidence coverage.
4. **Knowledge Graph & Timeline**: Assembles entity-relationship graphs and publication evolution timelines.

---

## 6. System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (React 18)                   │
│  Dashboard │ Paper Library │ Research Chat │ Compare │ Gaps │ Search  │
│  Knowledge Graph │ Timeline │ Evaluation Benchmark │ PDF Viewer Modal  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                         API TIER (FastAPI)                             │
│  /api/papers │ /api/chat │ /api/search │ /api/compare │ /api/gaps      │
│  /api/topics │ /api/knowledge-graph │ /api/timeline │ /api/evaluation  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         NLP & RAG ENGINE                               │
│  ┌──────────────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │ PDFExtractor & Fitz  │  │ TextCleaner     │  │ SectionDetector   │  │
│  └──────────────────────┘  └─────────────────┘  └───────────────────┘  │
│  ┌──────────────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │ IntelligentChunker   │  │ HybridRetriever │  │ ContextualRerank  │  │
│  └──────────────────────┘  └─────────────────┘  └───────────────────┘  │
│  ┌──────────────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │ CitationEngine       │  │ LLM Abstraction │  │ EvalService       │  │
│  └──────────────────────┘  └─────────────────┘  └───────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         DATA STORAGE TIER                              │
│  SQLite Relational DB (SQLAlchemy) │ FAISS Vector Store (.bin, .json) │
│  In-Memory BM25 Index              │ Physical PDF Uploads Directory    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Technologies Used

- **Python 3.11+ / FastAPI**: Asynchronous REST micro-framework offering OpenAPI autodocumentation and high throughput.
- **Pydantic v2**: High-performance request/response data validation and settings management.
- **SQLAlchemy 2.0**: Enterprise ORM with enforced SQLite foreign-key cascading pragmas.
- **PyMuPDF (fitz)**: C-optimized PDF rendering and text block coordinate extraction engine.
- **FAISS (Facebook AI Similarity Search)**: Industry standard $O(1)$ vector indexing using inner product cosine distance.
- **Rank-BM25**: Probabilistic BM25Okapi inverted index for keyword retrieval.
- **Sentence-Transformers & Subword Semantic Projections**: Dense vector representations capturing academic semantics.
- **React 18 & Vite**: Component-driven SPA with sub-second HMR and optimized production bundling.
- **Tailwind CSS**: Utility-first responsive design supporting full dark/light modes.
- **Recharts**: Composable SVG chart library for telemetry and topic distributions.
- **Lucide React**: Clean, accessible iconography.

---

## 8. Functional Requirements
- **FR-01 (PDF Upload)**: Ingest single or multi-PDF files up to 50MB, validate extension, and detect SHA-256 duplicates.
- **FR-02 (Text Extraction)**: Extract page count, metadata (title, author, year), text blocks, and sections.
- **FR-03 (Intelligent Chunking)**: Preserve section headers and page numbers without breaking mid-sentence.
- **FR-04 (Hybrid Retrieval)**: Execute dual FAISS cosine similarity and BM25 search with Reciprocal Rank Fusion.
- **FR-05 (Citation Grounding)**: Map all claims to `[X]` tags with document title, page number, and snippet.
- **FR-06 (Automated Refusal)**: Refuse out-of-corpus queries with standardized insufficient evidence message.
- **FR-07 (PDF Viewer)**: Jump to cited page, search inside paper, and highlight matching passages.
- **FR-08 (Structured Summarization)**: Generate 11 academic dimensions and beginner-friendly ELI5 analogies.
- **FR-09 (Multi-Paper Comparison)**: Generate feature comparison matrix (Problem, Dataset, Method, Model, Metrics, Results, Limitations).
- **FR-10 (Research Gaps)**: Discover literature gaps with High/Medium/Low evidence coverage ratings.
- **FR-11 (Knowledge Graph)**: Display interactive node-link relationships.
- **FR-12 (Evaluation Benchmark)**: Measure Precision@K, Recall@K, Faithfulness, and Latency on test suites.

---

## 9. Non-Functional Requirements
- **NFR-01 (Performance & Latency)**: Retrieval and grounded synthesis must execute under 200ms in local demo mode.
- **NFR-02 (Reliability & Fault Tolerance)**: Scanned or malformed PDFs must never crash the backend; errors must be captured with status `FAILED`.
- **NFR-03 (Zero External Dependency in Demo Mode)**: System must function 100% offline without requiring paid third-party API keys.
- **NFR-04 (Security)**: Filename sanitization, path traversal prevention, CORS restrictions, and file size quotas.
- **NFR-05 (Explainability)**: Every AI response must provide transparent reasoning steps and retrieval scoring breakdowns.

---

## 10. Database Schema & ER Design

### Entity Tables:
1. **`papers`**: `id` (PK), `title`, `authors`, `publication_year`, `abstract`, `page_count`, `file_name`, `file_path`, `file_size`, `file_hash`, `status`, `error_message`, `structured_summary`, `beginner_summary`, `created_at`, `updated_at`.
2. **`paper_chunks`**: `id` (PK), `paper_id` (FK $\to$ papers.id), `chunk_index`, `page_number`, `section_name`, `text`, `token_count`, `embedding_id`, `created_at`.
3. **`conversations`**: `id` (PK), `title`, `paper_id` (FK $\to$ papers.id, Nullable), `created_at`, `updated_at`.
4. **`messages`**: `id` (PK), `conversation_id` (FK $\to$ conversations.id), `sender` ('user'|'assistant'), `content`, `latency_ms`, `why_this_answer`, `created_at`.
5. **`citations`**: `id` (PK), `message_id` (FK $\to$ messages.id), `paper_id` (FK $\to$ papers.id), `chunk_id` (FK $\to$ paper_chunks.id), `citation_index`, `paper_title`, `authors`, `publication_year`, `page_number`, `section_name`, `snippet`, `confidence_score`, `created_at`.
6. **`topics`**: `id` (PK), `name`, `description`, `paper_count`, `created_at`.
7. **`paper_topics`**: `paper_id` (FK $\to$ papers.id), `topic_id` (FK $\to$ topics.id).
8. **`research_gaps`**: `id` (PK), `topic`, `title`, `description`, `evidence_json`, `confidence_coverage`, `created_at`.

---

## 11. Testing & Evaluation Methodology

### Testing Strategy:
- **Unit Testing**: Isolated verification of `TextCleaner`, `SectionDetector`, and `IntelligentChunker`.
- **RAG Integration Testing**: Verification of positive retrieval queries (ensuring citations and grounding) and negative out-of-domain queries (ensuring refusal without hallucination).
- **API Endpoint Testing**: Automated `TestClient` suite verifying all HTTP endpoints, status codes, and payloads.

### Quality Benchmarks:
$$\text{Retrieval Precision@K} = \frac{|\text{Retrieved Relevant Chunks}|}{K}$$
$$\text{Retrieval Recall@K} = \frac{|\text{Retrieved Target Papers}|}{|\text{Expected Target Papers}|}$$
$$\text{Answer Faithfulness} = \frac{|\text{Claims Verified by Source Passages}|}{|\text{Total Claims}|}$$
$$\text{Citation Coverage} = \min\left(1.0, \frac{|\text{Citations}|}{2}\right)$$

---

## 12. Conclusion & Future Scope
ResearchAI delivers a comprehensive, production-ready AI research companion that transforms how students and scientists interact with scientific literature. By moving beyond naive chatbots to a disciplined, structure-aware, hybrid RAG architecture with exact page-level provenance, the platform guarantees academic integrity and auditability.

**Future Scope:**
1. Integration of Vision-Language Models (VLMs) for multimodal extraction of complex scientific diagrams, plots, and chemical structures.
2. Extension of cross-lingual domain adaptation for non-English academic repositories.
3. Native LaTeX equation parsing and symbolic mathematical theorem verification.
