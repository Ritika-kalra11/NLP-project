# ResearchAI – Final Year MCA Viva Voce Preparation Guide
## 45 Comprehensive Technical Questions and Model Answers

This guide covers core concepts across Natural Language Processing, Transformer Architectures, Embeddings, Information Retrieval, Vector Databases, RAG, Citation Grounding, and Full-Stack Engineering implemented in ResearchAI.

---

### Section 1: NLP, Tokenization & Embeddings

#### Q1: What is the fundamental difference between word-level tokenization, character tokenization, and subword tokenization (e.g., BPE, WordPiece)?
**Answer:**  
- **Word-level tokenization** splits text on whitespace or punctuation. It suffers from massive vocabulary sizes (e.g., 500k+ words) and fails completely on Out-Of-Vocabulary (OOV) terms, misspellings, or scientific portmanteaus.
- **Character tokenization** splits text into individual characters. While vocabulary size is tiny (~100-256 tokens), sequence length explodes dramatically, exceeding transformer attention context windows and degrading syntactic learning.
- **Subword tokenization** (Byte-Pair Encoding, WordPiece, SentencePiece) finds an optimal statistical balance: frequent whole words remain intact tokens (e.g., `"transformer"` $\to$ `["transformer"]`), while rare, morphological, or technical terms are decomposed into subword units (e.g., `"SparseSciFormer"` $\to$ `["Sparse", "Sci", "##Former"]`). This guarantees zero OOV tokens with bounded vocabulary sizes (~30k-50k tokens).

#### Q2: What are dense embeddings, and how do they differ from traditional sparse representations like TF-IDF or One-Hot vectors?
**Answer:**  
- **Sparse representations** (One-Hot, Bag-of-Words, TF-IDF) map text into high-dimensional vectors (dimension equal to vocabulary size $V$, e.g., 50,000+), where almost all elements are zero. They rely strictly on lexical overlap; the vectors for `"physician"` and `"doctor"` are completely orthogonal (cosine similarity = 0).
- **Dense embeddings** (e.g., SentenceTransformers, Word2Vec) project text into continuous low-dimensional latent vector spaces (e.g., 384 or 768 dimensions), where every dimension is a continuous float representing learned semantic features. Semantically synonymous sentences or technical phrases map into close spatial proximity regardless of exact keyword overlap.

#### Q3: Why is L2 normalization critical before calculating Cosine Similarity in vector databases?
**Answer:**  
Cosine similarity between vectors $\mathbf{u}$ and $\mathbf{v}$ is defined as:
$$\text{Cosine Similarity}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$
If vectors are pre-normalized using L2 normalization such that $\|\mathbf{u}\|_2 = 1.0$ and $\|\mathbf{v}\|_2 = 1.0$, the cosine similarity simplifies purely to the dot product (inner product):
$$\text{Cosine Similarity}(\mathbf{u}, \mathbf{v}) = \mathbf{u} \cdot \mathbf{v}$$
This enables vector search engines like FAISS `IndexFlatIP` to execute ultra-fast, SIMD/AVX hardware-accelerated matrix multiplications without having to repeatedly compute square roots and vector norms at query time.

#### Q4: What is the Curse of Dimensionality, and how does it impact vector similarity search?
**Answer:**  
As dimensionality $D$ increases into hundreds or thousands of dimensions, the volume of the space grows exponentially, causing all data points to become approximately equidistant from one another in Euclidean space (distance ratio $\frac{d_{\max} - d_{\min}}{d_{\min}} \to 0$). In vector retrieval, this reduces the discriminating power of distance metrics. Mitigations include using cosine angle distance, dimension reduction techniques (PCA), and Hierarchical Navigable Small World (HNSW) graph indexing.

---

### Section 2: Transformer Architectures & Self-Attention

#### Q5: How does the Scaled Dot-Product Attention mechanism work mathematically?
**Answer:**  
Given Query ($Q$), Key ($K$), and Value ($V$) matrices projected from input embeddings:
$$\text{Attention}(Q, K, V) = \text{Softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$
1. $Q K^T$ calculates pairwise raw affinity scores between every token query and all token keys.
2. $\sqrt{d_k}$ is the scaling factor (where $d_k$ is the dimension of the key vectors). For large $d_k$, dot products grow large in magnitude, pushing the Softmax function into regions with vanishingly small gradients. Scaling stabilizes gradient backpropagation.
3. Softmax normalizes row scores into attention probability distributions summing to 1.0.
4. Multiplying by $V$ computes a weighted sum of the values representing contextualized token embeddings.

#### Q6: Why does standard full self-attention exhibit quadratic $O(N^2)$ computational and memory complexity?
**Answer:**  
For an input sequence of length $N$, computing the dot product of every token against every other token requires computing an $N \times N$ attention matrix. Storing this attention matrix in memory requires $O(N^2)$ GPU VRAM. For $N=1,000$, $N^2 = 10^6$ operations; for $N=16,000$ (typical research paper), $N^2 = 2.56 \times 10^8$ operations per attention head per layer, causing memory exhaustion on accelerator hardware.

#### Q7: What are Sparse Transformers, and how do they achieve linear or sub-quadratic complexity?
**Answer:**  
Sparse transformers (like Longformer, BigBird, and the SparseSciFormer paper discussed in ResearchAI) decompose the dense $N \times N$ attention matrix using structured sparsity masks:
1. **Local sliding-window attention**: Each token only attends to its $W$ immediate neighbors ($O(N \cdot W)$).
2. **Strided / dilated attention**: Tokens attend to every $d$-th token to expand receptive field.
3. **Global anchor tokens**: Specific structural tokens (such as `[CLS]`, section headings, or citation brackets) attend to all tokens, and all tokens attend to them.
This reduces total complexity to $O(N \cdot (W + G))$, which scales linearly $O(N)$.

---

### Section 3: Document Processing, OCR & Chunking

#### Q8: Why is naive fixed-size chunking (e.g., every 500 characters) problematic for academic papers, and what is structure-aware chunking?
**Answer:**  
- **Naive chunking** splits text purely by character count. In scientific papers, this arbitrarily cuts mathematical equations in half, splits hypotheses from their experimental results, and severs section headings from their paragraphs.
- **Structure-aware chunking** (implemented in ResearchAI's `IntelligentChunker`) respects academic document hierarchies:
  1. It recognizes sections (Abstract, Methodology, Results, Limitations).
  2. It treats section headers as hard boundaries so chunks don't conflate unrelated sections.
  3. It preserves paragraph boundaries and breaks on punctuation/sentence boundaries.
  4. It retains immutable page number provenance for citation grounding.

#### Q9: What is OCR fallback, and when is it triggered in PDF processing pipelines?
**Answer:**  
Digital PDFs store text as font glyph streams with coordinates. However, scanned papers, preprints, or legacy journal archives contain rasterized bitmap images without selectable digital text streams. In PyMuPDF, if a page's extracted character count is below a threshold (e.g., $< 30$ characters), the pipeline flags the page as a scanned image and triggers an OCR fallback (e.g., Tesseract OCR or Vision API) to synthesize the underlying digital text.

#### Q10: How does TextCleaner handle ligatures and hyphenated linebreaks in academic typesetting?
**Answer:**  
Scientific typesetting engines (like LaTeX) often render letter combinations as aesthetic ligatures (e.g., "ﬁ" $\to$ U+FB01, "ﬂ" $\to$ U+FB02). Standard search queries look for ASCII "fi" or "fl", causing search misses. `TextCleaner` applies Unicode NFKC normalization and maps ligature codepoints back to standard character pairs. Furthermore, words hyphenated across column margins (e.g., `"trans-\nformer"`) are de-hyphenated using regex lookaheads into continuous tokens (`"transformer"`).

---

### Section 4: Information Retrieval, Vector DBs & BM25

#### Q11: What is BM25, and why is it valuable even when dense vector embeddings are available?
**Answer:**  
BM25 (Best Matching 25) is a probabilistic bag-of-words retrieval algorithm based on Term Frequency (TF) and Inverse Document Frequency (IDF) with document length normalization and term saturation parameters ($k_1 \approx 1.5, b \approx 0.75$).  
While dense vector embeddings capture thematic semantics (e.g., matching "heart attack" to "myocardial infarction"), they frequently fail on exact technical entities, unique algorithm acronyms (e.g., "SparseSciFormer"), specific author names, or mathematical variable identifiers. BM25 guarantees exact lexical matching for specialized scientific terms.

#### Q12: How does Reciprocal Rank Fusion (RRF) work in ResearchAI's HybridRetriever?
**Answer:**  
Reciprocal Rank Fusion merges rankings from disparate retrieval algorithms without requiring raw score normalization:
$$\text{RRF Score}(d) = \sum_{m \in M} \frac{w_m}{k + r_m(d)}$$
- $r_m(d)$ is the 1-based rank of document $d$ in system $m$ (Dense FAISS or Sparse BM25).
- $k$ is a smoothing constant (typically $k=60$) preventing high-ranking outliers from dominating.
- $w_m$ weights the importance of each retriever (e.g., $w_{\text{dense}}=0.65, w_{\text{sparse}}=0.35$).
RRF is scale-invariant and immune to distribution differences between cosine similarities and BM25 scores.

#### Q13: What is the purpose of Contextual Reranking after hybrid retrieval?
**Answer:**  
First-stage retrieval (FAISS + BM25) prioritizes high recall over a pool of candidate chunks (e.g., top-20). The `ContextualReranker` applies fine-grained heuristic or cross-encoder scoring to rank the top-5 candidates for the LLM prompt budget. In ResearchAI, it boosts scores based on intent-to-section congruence:
- If query mentions "methodology" or "architecture", chunks from `Methodology` sections receive positive weight.
- If query mentions "limitation" or "threats", chunks from `Limitations` sections receive positive weight.
- It also measures lexical query term coverage across chunk bodies and paper titles.

#### Q14: How does FAISS store vectors and perform similarity search?
**Answer:**  
FAISS (Facebook AI Similarity Search) organizes dense float32 vectors in optimized memory layouts. ResearchAI uses `IndexFlatIP` (Inner Product). Because embeddings are L2-normalized, the inner product is mathematically identical to Cosine Similarity. For a dataset of $N$ chunks of dimension $D$, searching a query vector $Q$ performs SIMD-vectorized matrix multiplication against the contiguous index block, returning top-$K$ indices and scores in sub-millisecond time.

---

### Section 5: Retrieval-Augmented Generation (RAG) & Grounding

#### Q15: What is the core lifecycle of a RAG pipeline from query to answer?
**Answer:**  
1. **Query Preprocessing**: Clean query string, extract search filters (e.g., specific paper ID), filter stopwords.
2. **Dual Retrieval**: Generate dense embedding for FAISS search; tokenize query for BM25 search.
3. **Hybrid Fusion**: Merge rankings via Reciprocal Rank Fusion (RRF).
4. **Contextual Reranking**: Re-score candidates based on section congruence and lexical coverage.
5. **Context Assembly**: Construct prompt with explicit `[Source X]` metadata blocks.
6. **Constrained Generation**: Prompt LLM to answer strictly from context and output citation tags `[X]`.
7. **Citation Verification**: Map tags to source chunks, validate evidence snippets, enforce refusal if similarity is low.

#### Q16: How does ResearchAI prevent hallucinated citations?
**Answer:**  
Unlike generic chatbots that guess references, ResearchAI implements two architectural safeguards:
1. **Deterministic Context Injection**: The generator only receives retrieved chunks tagged as `[Source 1]`, `[Source 2]`. It is instructed that assertions without corresponding bracket tags will be discarded.
2. **Post-Generation Provenance Mapping**: The `CitationEngine` extracts generated tags (`[1]`, `[2]`), looks up the exact chunk in the database, extracts the verbatim supporting snippet, and attaches the physical page number.
3. **Similarity Refusal Threshold**: If top retrieved chunks have similarity below threshold $\tau$ (e.g., 0.20), the system suppresses answer generation and emits the standardized grounded refusal: *"I could not find sufficient evidence in the uploaded papers to answer this question."*

#### Q17: What is the difference between extractive QA and abstractive QA?
**Answer:**  
- **Extractive QA**: Selects a contiguous text span directly from the source document to answer the question (e.g., classic BERT SQuAD models). Highly faithful, but cannot synthesize across multiple sentences.
- **Abstractive QA**: Generates a natural language response paraphrasing and synthesizing information from multiple source passages using a generative language model. More coherent and capable of multi-document reasoning, but prone to hallucinations without citation constraints.
ResearchAI combines both: it generates abstractive synthesis while backing each statement with extractive verbatim citations.

---

### Section 6: Research Gaps, Comparisons & Contradictions

#### Q18: How does ResearchAI detect research gaps without hallucinating?
**Answer:**  
ResearchAI avoids hallucinating gaps by anchoring gap detection to explicit literature evidence:
1. It queries chunks categorized under `Limitations`, `Discussion`, and `Future Work` across all papers.
2. It aggregates common keywords (e.g., "cross-domain", "complexity", "monolingual", "lack of benchmarks").
3. Each discovered gap displays exact citations (`Paper A -> Page 8`, `Paper B -> Page 10`).
4. It computes **Confidence Coverage** based on literature consensus: High (supported by 3+ papers), Medium (2 papers), or Low (single paper).

#### Q19: Why shouldn't two research papers be considered contradictory simply because their accuracy results differ?
**Answer:**  
In scientific research, differing quantitative results (e.g., Model A gets 85% accuracy, Model B gets 72%) rarely indicate theoretical contradiction. Instead, they typically reflect **experimental condition differences**:
- Different benchmark datasets (e.g., PubMed vs. SciDocs)
- Different context length limits (1,024 tokens vs. 16,384 tokens)
- Different hardware constraints or hyperparameter tuning
- Differing evaluation metrics (exact match vs. token-level F1)
ResearchAI's `ConsistencyAnalyzer` explicitly isolates condition differences from fundamental theoretical disagreements.

#### Q20: How is the multi-paper comparison matrix generated and grounded?
**Answer:**  
When users select multiple papers, `PaperComparator` queries the database for each paper across 7 canonical dimensions: Problem, Dataset, Method, Model, Metrics, Results, and Limitations. For each cell, it retrieves the section-specific chunk, extracts a concise summary, and captures the exact sentence snippet and physical page number so users can audit the comparison directly against the source PDF.

---

### Section 7: Knowledge Graphs & Topic Discovery

#### Q21: What is a Knowledge Graph in the context of scientific literature?
**Answer:**  
A Knowledge Graph models scientific literature as a directed graph $G = (V, E)$, where vertices $V$ represent scientific entities (Authors, Papers, Models, Datasets, Tasks, Domains) and edges $E$ represent semantic relationships (e.g., `Author -[published]-> Paper`, `Paper -[uses]-> Model`, `Paper -[evaluates_on]-> Dataset`, `Paper -[addresses]-> Task`, `Paper -[cites]-> Paper`). This enables multi-hop relational discovery that traditional keyword searches cannot uncover.

#### Q22: How does ResearchAI extract topics across papers?
**Answer:**  
`TopicService` maintains a curated scientific ontology of NLP and AI themes (e.g., Transformer Architectures, RAG Systems, Citation Grounding, Cross-Domain Generalization). It scans extracted abstracts and chunks, scores document relevance using keyword frequency and semantic matching, links matching papers to topic records in SQLite, and extracts representative text passages.

---

### Section 8: Evaluation Metrics & Quality Benchmarks

#### Q23: Explain the evaluation metrics used in ResearchAI's developer module: Precision@K, Recall@K, Faithfulness, and Citation Coverage.
**Answer:**  
- **Retrieval Precision@K**: Fraction of top-$K$ retrieved chunks that contain keywords and topics relevant to the research query. Measures retrieval cleanliness.
- **Retrieval Recall@K**: Fraction of expected target papers successfully retrieved within the top candidate pool. Measures literature coverage.
- **Answer Faithfulness**: Percentage of claims in the generated answer that are directly supported by verbatim text in cited passages. Measures absence of hallucination.
- **Citation Coverage**: Ratio of citation markers to generated answer paragraphs. Ensures that every major assertion is attributed to a source.
- **Latency (ms)**: Round-trip processing time for query vectorization, hybrid retrieval, reranking, and synthesis.

#### Q24: What is the difference between Faithfulness and Answer Relevance in RAG evaluation (e.g., RAGAS framework)?
**Answer:**  
- **Faithfulness** measures whether the generated answer is grounded in the retrieved context (no hallucination). An answer can be completely faithful to irrelevant context (e.g., Q: "What is BERT?", Context: "Apples are red", Answer: "Apples are red" is 100% faithful, but 0% relevant).
- **Answer Relevance** measures whether the generated answer directly addresses the user's question, regardless of source grounding. High-quality RAG requires both high Faithfulness and high Relevance.

---

### Section 9: Full-Stack Architecture, FastAPI & React

#### Q25: Why is FastAPI chosen over Flask or Django for building high-performance AI backends?
**Answer:**  
1. **Asynchronous Concurrency**: Built on `Starlette` and `uvicorn` using Python's `asyncio`, handling hundreds of concurrent I/O-bound requests (file uploads, vector lookups, streaming API calls) without blocking worker threads.
2. **Pydantic Validation**: Automatic schema enforcement, type coercion, and serialization.
3. **OpenAPI / Swagger Autodocumentation**: Generates interactive API documentation at `/docs` out-of-the-box.
4. **Performance**: Significantly faster throughput compared to synchronous WSGI frameworks like Flask.

#### Q26: How does ResearchAI enforce SQLite foreign key constraints, and why is it necessary?
**Answer:**  
By default in SQLite, foreign key constraint enforcement is disabled for backwards compatibility. ResearchAI attaches an event listener to SQLAlchemy's engine connect hook:
```python
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
```
This guarantees referential integrity: if a paper is deleted, all associated `PaperChunk` and `Citation` records are automatically cascade-deleted, preventing orphaned database rows.

#### Q27: How does the React frontend maintain responsive performance with large document text and interactive graphs?
**Answer:**  
1. **Client-Side Virtualization & Pagination**: In `PDFViewerModal`, text is rendered page-by-page rather than dumping an entire 50-page manuscript into the DOM at once.
2. **SVG ViewBox Scaling**: The `KnowledgeGraph` uses responsive SVG coordinate systems (`viewBox="0 0 750 480"`) with CSS hardware acceleration, avoiding DOM bloat.
3. **Vite Optimized Bundling**: Code splitting and tree-shaking produce minimal production bundles.

#### Q28: How does the system handle multi-turn conversational chat memory?
**Answer:**  
The `Conversation` table stores session IDs. When a user asks a follow-up question (e.g., "What are its limitations?"), the backend fetches the last 4 turns from the `Message` table and prepends them to the LLM prompt context. The hybrid retriever also incorporates the contextual conversation history to resolve coreferences (e.g., recognizing that "its" refers to "SparseSciFormer").

---

### Section 10: Additional In-Depth Viva Questions (Q29 - Q45)

#### Q29: What is the difference between bi-encoders and cross-encoders in retrieval?
**Answer:**  
- **Bi-encoders** embed queries and documents independently into vectors: $\mathbf{q} = f(Q), \mathbf{d} = f(D)$. Similarity is calculated via fast dot product: $\mathbf{q} \cdot \mathbf{d}$. Highly efficient for large-scale retrieval over millions of chunks.
- **Cross-encoders** concatenate query and document into a single sequence: $[CLS] Q [SEP] D [SEP]$, passing all tokens through all cross-attention layers. Significantly more accurate because query and document tokens attend to each other directly, but computationally expensive ($O(N)$ inference passes). ResearchAI uses bi-encoders for retrieval and cross-encoder logic for reranking top candidates.

#### Q30: What is Reciprocal Rank Fusion constant $k$, and what happens if $k$ is too small or too large?
**Answer:**  
In $\text{RRF Score} = \frac{1}{k + r}$, $k$ controls the relative weight of top ranks versus lower ranks. If $k$ is very small ($k=1$), rank 1 gets score 0.5 and rank 2 gets score 0.33 (a 34% drop), making top ranks overly dominant. If $k$ is very large ($k=1000$), rank 1 and rank 10 have almost identical scores ($0.000999$ vs $0.000990$), flattening the ranking. Standard empirical research (Cormack et al.) found $k=60$ to be the optimal universal parameter across diverse corpora.

#### Q31: How does ResearchAI handle duplicate document uploads?
**Answer:**  
When a PDF is uploaded, the backend calculates the cryptographic SHA-256 hash of the file bytes. Before running OCR, text extraction, or embeddings, it queries the `papers` table for `file_hash`. If a match is found, it immediately reuses the existing indexed document without duplicate embedding computation or vector bloating.

#### Q32: What happens if an uploaded PDF is completely corrupted or invalid?
**Answer:**  
The pipeline wraps extraction in structured try-catch handlers. If PyMuPDF fails to parse the file header, it records status as `FAILED`, writes the error message to the database, and returns a clean HTTP 400 error to the frontend with an actionable notification, ensuring the server process never crashes.

#### Q33: What is the purpose of Temperature in LLM generation, and why is it set to 0.2 in ResearchAI?
**Answer:**  
Temperature $T$ scales the logits before the Softmax function in token sampling: $P(w_i) = \frac{\exp(z_i / T)}{\sum \exp(z_j / T)}$. High temperature ($T > 0.8$) flattens probabilities, encouraging creative and random token selection. Low temperature ($T \approx 0.1-0.2$) sharpens probabilities, concentrating sampling on the highest-confidence tokens. In scientific research QA, low temperature ($T=0.2$) is mandatory to enforce factual precision, determinism, and strict adherence to context.

#### Q34: What is the purpose of Hashing in the deterministic semantic vectorizer fallback?
**Answer:**  
Feature hashing (the "Hashing Trick") projects arbitrary words and character n-grams into a fixed-size vector space using cryptographic hash functions (MD5/SHA-256). It requires zero network calls, zero learned weights in memory, and produces identical dense vectors across machine restarts, guaranteeing 100% offline uptime for student viva demonstrations.

#### Q35: How does the PDF viewer jump to the exact cited page when a user clicks a citation?
**Answer:**  
Each `Citation` object in the database and API response contains `paper_id` and `page_number`. When the user clicks the citation card or inline tag in React, it calls `onJumpToPage(paperId, pageNumber)`. This updates `viewerState.initialPage = pageNumber` and opens `PDFViewerModal`, which retrieves the page-by-page extracted data and scrolls directly to that page.

#### Q36: What is the role of Uvicorn in running FastAPI?
**Answer:**  
FastAPI is an ASGI (Asynchronous Server Gateway Interface) application framework, not an HTTP web server itself. Uvicorn is a lightning-fast ASGI web server implementation based on `uvloop` and `httptools` that handles incoming TCP socket connections, parses HTTP/1.1 and WebSockets, and dispatches requests to FastAPI's async event loop.

#### Q37: How does ResearchAI's Demo Mode work without an OpenAI API key?
**Answer:**  
When `DEMO_MODE=true` (or when no API key is set), `LLMService` engages the **Grounded Demo Synthesis Engine**. This engine performs genuine hybrid retrieval over the vector database, identifies the most relevant sentence spans answering the query from each retrieved chunk, synthesizes a structured academic paragraph with exact citation indices `[1]`, and maps them to physical PDF page coordinates. Real vector search and real chunking are executed without faking results.

#### Q38: What are stopwords, and why did removing them improve BM25 retrieval precision in our pipeline?
**Answer:**  
Stopwords are high-frequency grammatical words in a language (e.g., "is", "the", "for", "on", "what"). In BM25 without stopword filtering, a natural language query like *"What is the recipe for baking cookies on Mars?"* will match academic papers containing "what", "is", "the", "for", and "on", producing false-positive lexical hits. Filtering stopwords ensures that BM25 only searches for meaningful domain terms ("recipe", "baking", "cookies", "mars").

#### Q39: What is the role of Cross-Origin Resource Sharing (CORS) in this project?
**Answer:**  
The React frontend runs on `http://localhost:5173`, while the FastAPI backend runs on `http://localhost:8000`. Because origins (ports) differ, web browsers block API requests under the Same-Origin Policy. FastAPI's `CORSMiddleware` explicitly allows requests from the frontend origin, permitting cross-origin HTTP methods (`GET`, `POST`, `DELETE`) and headers.

#### Q40: What is the SciDocs benchmark mentioned in the demo papers?
**Answer:**  
SciDocs is an established open benchmark for evaluating scientific document representations across multiple tasks: citation prediction, co-viewing classification, section categorization, and paper recommendation across 20,000+ academic papers.

#### Q41: How does the system extract 11 structured summary dimensions from a paper?
**Answer:**  
`PaperSummarizer` maps chunks to their section types (Abstract $\to$ Abstract Summary, Introduction $\to$ Problem & Objectives, Methodology $\to$ Architecture, Results $\to$ Empirical findings, Limitations $\to$ Constraints). If an external LLM is configured, it prompts the model with these structured sections to output JSON matching the 11 keys. In demo mode, it synthesizes these sections deterministically and caches the JSON in SQLite.

#### Q42: What is the difference between RAG and Fine-Tuning?
**Answer:**  
- **Fine-Tuning** updates the internal parametric weights of an LLM on domain text. It adapts model style, tone, and domain vocabulary, but cannot reliably memorize dynamic facts, cannot cite exact page numbers, and suffers from catastrophic forgetting.
- **RAG** leaves model weights untouched and injects external facts into the prompt at runtime from a vector database. It enables instant updates (uploading a new paper takes seconds), guarantees auditability with source citations, and costs significantly less to maintain.

#### Q43: What is Context Window Fragmentation in long-document RAG?
**Answer:**  
When an answer requires synthesizing evidence across multiple distant pages (multi-hop reasoning), retrieving isolated 600-character chunks can fragment the narrative. ResearchAI mitigates this by maintaining paragraph overlap and using RRF to retrieve adjacent and complementary chunks across sections.

#### Q44: How does the system handle dark and light mode persistence?
**Answer:**  
`ThemeContext.jsx` manages a `theme` state ('dark' or 'light'). On toggle, it adds or removes the `dark` class from the HTML document element and writes the preference to the browser's `localStorage` (`researchai_theme`), ensuring user theme preferences persist across page reloads.

#### Q45: Why is ResearchAI considered an enterprise/academic-grade final-year project rather than a simple CRUD or wrapper chatbot?
**Answer:**  
1. Genuine, complete NLP & IR pipeline: custom text cleaning, IMRAD section detection, structure-aware intelligent chunking.
2. Dual dense (FAISS) and sparse (BM25) hybrid retrieval with Reciprocal Rank Fusion.
3. Strict citation grounding with physical page navigation in an integrated PDF viewer.
4. Autonomous multi-paper comparative matrices and consistency auditing.
5. Literature research gap discovery with evidence coverage ratings.
6. Interactive SVG Knowledge Graph and publication timeline.
7. Empirical RAG quality evaluation telemetry with visual charting.
8. Robust Dockerization, clean architectural separation, and complete unit/integration test suites.
