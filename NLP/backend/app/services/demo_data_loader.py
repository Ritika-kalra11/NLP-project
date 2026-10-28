"""
Demo Data Loader.
Generates genuine academic PDF research papers using PyMuPDF and indexes them on startup
so the application is fully functional out-of-the-box for evaluation and viva demonstrations.
"""

import os
import hashlib
import logging
from pathlib import Path
import fitz  # PyMuPDF
from sqlalchemy.orm import Session

from app.config import settings
from app.models.paper import Paper
from app.services.paper_service import PaperService

logger = logging.getLogger(__name__)


SAMPLE_PAPERS_SPEC = [
    {
        "file_name": "Attention_Mechanisms_Sparse_Transformers_2023.pdf",
        "title": "Attention Mechanisms and Sparse Transformers for Long-Context Scientific Document Processing",
        "authors": "Ashish Vaswani, Lin Chen, David Miller",
        "year": 2023,
        "pages": [
            # Page 1
            """Attention Mechanisms and Sparse Transformers for Long-Context Scientific Document Processing
Ashish Vaswani, Lin Chen, David Miller
Department of Computer Science, AI Research Institute, 2023

ABSTRACT
Scientific research papers present formidable challenges for standard Transformer architectures due to their extensive length, dense citations, and multi-scale thematic hierarchies. Traditional self-attention mechanisms exhibit quadratic O(N^2) computational time and memory complexity with respect to input sequence length N. In this study, we propose SparseSciFormer, a specialized sparse attention architecture engineered for long-context scientific document parsing. By decomposing the global attention matrix into local windowed strided attention combined with global citation token anchors, SparseSciFormer scales attention linearly to 16,384 tokens while preserving 98.4% of full-attention representation fidelity. We evaluate our approach on comprehensive document modeling benchmarks and demonstrate substantial throughput gains on single-GPU hardware.

1. INTRODUCTION
The exponential growth of scientific literature demands computational systems capable of digesting multi-page documents holistically. While transformer models have achieved remarkable success across NLP benchmarks, their standard full self-attention requires computing all pairwise token interactions. For a document exceeding 10,000 tokens, memory consumption routinely triggers out-of-memory errors on standard accelerator devices. Prior approaches have explored fixed sliding-window attention or random projections, but often fail to retain cross-section conceptual links, such as mapping methodological equations in Section 3 to empirical findings in Section 5.

2. RELATED WORK
Early investigations into sparse transformers (Child et al., 2019) demonstrated that structured sparsity patterns can approximate dense self-attention. Longformer (Beltagy et al., 2020) and BigBird (Zaheer et al., 2020) introduced combinations of local sliding windows, dilated strides, and global tokens for long texts. However, these architectures treat all scientific tokens uniformly, ignoring specific academic discourse signals like section headings, mathematical definitions, and reference markers.""",

            # Page 2
            """3. METHODOLOGY & SPARSE ARCHITECTURE
To address quadratic memory explosion, SparseSciFormer establishes a hybrid attention matrix S = A_local + A_strided + A_global. 
The local attention component A_local restricts token queries to a symmetric window W of size 256, capturing immediate syntactic dependencies and intra-paragraph arguments. 
The strided attention component A_strided samples every d-th token (with stride d=16), providing coarse-grained receptive fields across adjacent paragraphs.
Crucially, our architecture designates all section header tokens and citation brackets as permanent global anchor tokens A_global. Every standard token attends to these global anchors, and global anchors attend to all tokens.

Mathematical Formulation:
Given Query Q, Key K, and Value V matrices in R^(N x d_k), our attention weight is computed as:
Attention(Q, K, V) = Softmax((Q * K^T) / sqrt(d_k) + M_sparse) * V
where M_sparse is a binary mask assigning 0 to connected indices and -infinity to pruned connections. This reduces computational complexity from O(N^2) to O(N * (W + N/d + G)), where G << N represents the count of global anchors.

4. EXPERIMENTAL SETUP
We benchmark SparseSciFormer across the SciDocs scientific document corpus and a newly assembled dataset of 5,000 multi-page preprints. 
All models are implemented in PyTorch and trained using AdamW with cosine learning rate decay on NVIDIA RTX 4090 GPUs. 
Baselines include Standard Transformer, Longformer-base, and BigBird-base with sequence lengths tested from 1,024 to 16,384 tokens.""",

            # Page 3
            """5. EMPIRICAL RESULTS
Table 1 reports perplexity, classification F1, and peak VRAM consumption across model variants at 8,192 token length.
SparseSciFormer achieves an F1 score of 89.2% on scientific section categorization, outperforming Longformer (86.4%) and BigBird (85.8%), while reducing peak memory by 64.2%. 
In terms of inference latency, our model processes an entire 12-page manuscript in 142 milliseconds, compared to 890 milliseconds for dense windowed fallbacks.

6. LIMITATIONS & THREATS TO VALIDITY
Despite strong empirical advantages, our study exhibits several defined limitations:
First, the global anchor assignment currently relies on accurate section detection; noisy PDF text extractions with malformed headers degrade anchor quality.
Second, while computational complexity scales linearly, the constant factor introduced by sparse kernel gather-scatter operations remains hardware-dependent.
Third, evaluations were strictly limited to English-language computer science preprints, leaving cross-lingual biomedical performance for future research.

7. CONCLUSION & FUTURE WORK
We presented SparseSciFormer, demonstrating that structure-aware sparse attention enables efficient, high-fidelity scientific document processing. Future directions include dynamic learned anchors and multi-modal integration of figure captions.

REFERENCES
[1] Vaswani et al., Attention is all you need. NeurIPS 2017.
[2] Beltagy et al., Longformer: The long-document transformer. arXiv:2004.05150, 2020.
[3] Zaheer et al., Big bird: Transformers for longer sequences. NeurIPS 2020."""
        ]
    },
    {
        "file_name": "Robust_RAG_Citation_Hallucination_Mitigation_2024.pdf",
        "title": "Robust Retrieval-Augmented Generation with Source Citation and Hallucination Mitigation",
        "authors": "Patrick Lewis, Maria Rodriguez, Kevin Patel",
        "year": 2024,
        "pages": [
            # Page 1
            """Robust Retrieval-Augmented Generation with Source Citation and Hallucination Mitigation
Patrick Lewis, Maria Rodriguez, Kevin Patel
Center for AI Safety and Information Retrieval, 2024

ABSTRACT
Large language models (LLMs) deployed for scientific inquiry frequently hallucinate plausible-sounding but completely fabricated assertions, citations, and experimental outcomes. Retrieval-Augmented Generation (RAG) mitigates this vulnerability by conditioning text generation on retrieved external documents. However, conventional RAG systems suffer from citation misalignment, where generated claims attribute findings to irrelevant or non-existent document pages. In this paper, we present VeriRAG, a robust retrieval framework incorporating hybrid dense-sparse retrieval via Reciprocal Rank Fusion (RRF) and post-generation citation mapping. Across rigorous evaluation benchmarks, VeriRAG reduces ungrounded hallucinations by 82.5% and achieves a citation attribution precision of 94.1%.

1. INTRODUCTION
In high-stakes academic and clinical domains, ungrounded AI answers undermine user trust and propagate misinformation. When asked about experimental findings or methodological constraints, standard parametric models generate confident statements with fictitious authors and non-existent DOIs. RAG architectures offer an appealing solution by decoupling knowledge storage from parametric weights. Yet, naive chunking and basic vector similarity search frequently retrieve irrelevant snippets, leading the generator to hallucinate bridging explanations between mismatched fragments.

2. HYBRID RETRIEVAL ARCHITECTURE
VeriRAG employs a dual-stage retrieval pipeline combining dense vector embeddings with lexical BM25 retrieval. While dense bi-encoders excel at capturing thematic semantic similarity, they frequently miss exact technical terms, mathematical variable symbols, or specific author surnames. Conversely, BM25 enforces exact keyword precision but fails on paraphrased natural language questions.
We unify dense and sparse rankings using Reciprocal Rank Fusion (RRF):
RRF_Score(d) = (w_dense / (k + rank_dense(d))) + (w_sparse / (k + rank_sparse(d)))
where k=60, w_dense=0.65, and w_sparse=0.35.""",

            # Page 2
            """3. CITATION MAPPING AND VERIFICATION ENGINE
Unlike standard chatbots that append generic bibliographies, VeriRAG implements granular provenance tracking. Every retrieved passage is tagged with an immutable source identifier containing document ID, page number, and section name.
During generation, the model is constrained by system prompts to tag each factual claim with an exact bracketed index [X].
Our citation verification engine performs two critical checks:
1. Lexical and NLI entailment: Does the cited chunk contain semantic entailment for the attributed assertion?
2. Page Provenance Validation: Verifies that the cited page exists in the physical PDF and maps the exact coordinates for interactive document viewer highlighting.
If the similarity score of retrieved passages falls below threshold tau=0.20, or if evidence is insufficient, the system enforces a strict refusal protocol: "I could not find sufficient evidence in the uploaded papers to answer this question."

4. EXPERIMENTAL EVALUATION
We evaluated VeriRAG against Dense-Only RAG, Sparse-Only RAG, and Closed-Book GPT-4 across 1,200 scientific questions drawn from PubMed QA and the SciCite benchmark. 
Evaluation metrics comprise:
- Retrieval Precision@5
- Faithfulness (percentage of claims verified by cited source passages)
- Citation Coverage (percentage of non-trivial claims supported by citations)
- Latency (milliseconds per answer)""",

            # Page 3
            """5. RESULTS AND ABLATION STUDY
Experimental results reveal that VeriRAG achieves 94.1% faithfulness, compared to only 68.2% for Dense-Only RAG and 31.4% for Closed-Book LLMs. 
The combination of RRF hybrid retrieval improved Retrieval Precision@5 from 0.71 to 0.89. 
Ablation studies demonstrate that removing BM25 lexical matching caused a 28% drop in retrieval accuracy for queries containing specialized chemical formulas or algorithm acronyms.

6. LIMITATIONS
We note two primary limitations:
First, multi-hop reasoning requiring synthesis across more than four separate papers occasionally struggles with context window fragmentation.
Second, the latency overhead of hybrid retrieval and reranking adds approximately 120ms compared to unverified greedy generation, although this trade-off is highly justified for academic integrity.

7. CONCLUSION
VeriRAG demonstrates that disciplined hybrid retrieval, strict citation attribution, and automated refusal safeguards virtually eliminate hallucinated claims in scientific question answering.

REFERENCES
[1] Lewis et al., Retrieval-augmented generation for knowledge-intensive NLP tasks. NeurIPS 2020.
[2] Robertson et al., The probabilistic relevance framework: BM25 and beyond. FnTIR 2009.
[3] Gao et al., Retrieval-augmented generation for large language models: A survey. arXiv:2312.10997, 2023."""
        ]
    },
    {
        "file_name": "Cross_Domain_Generalization_Scientific_NLP_2025.pdf",
        "title": "Cross-Domain Generalization and Evaluation Benchmarks for Scientific NLP Models",
        "authors": "Priya Gupta, Min-Jun Kim, Sarah Smith",
        "year": 2025,
        "pages": [
            # Page 1
            """Cross-Domain Generalization and Evaluation Benchmarks for Scientific NLP Models
Priya Gupta, Min-Jun Kim, Sarah Smith
Global Institute of Technology & AI Research Consortium, 2025

ABSTRACT
State-of-the-art NLP models demonstrate impressive benchmark performance on scientific document understanding when evaluated within the same scientific discipline on which they were pre-trained. However, real-world research workflows routinely span interdisciplinary inquiries spanning materials science, bioinformatics, quantum computing, and economics. In this paper, we conduct an extensive multi-institutional study analyzing cross-domain generalization degradation across twelve specialized scientific domains. We introduce SciCross, a curated open-source benchmark consisting of 25,000 annotated document pairs with challenging cross-domain transfer tasks. Our findings demonstrate that standard transformers suffer an average performance drop of 34.6% under out-of-distribution domain shift, and we propose domain-invariant representation learning strategies to restore transfer robustness.

1. INTRODUCTION
Interdisciplinary scientific breakthroughs increasingly occur at the intersection of traditional academic boundaries—such as applying machine learning to drug discovery or computational physics to financial risk modeling. Consequently, automated research paper assistants must comprehend specialized terminology across heterogeneous domains without catastrophic degradation. While existing benchmarks like SciDocs and PubMed QA evaluate in-domain competence within computer science and biomedicine respectively, there is a distinct lack of standardized frameworks measuring cross-domain resilience.

2. BENCHMARK CORPUS DESIGN: SCICROSS
The SciCross benchmark spans twelve scientific disciplines: Computer Science, Biomedicine, High-Energy Physics, Materials Science, Chemical Engineering, Economics, Computational Neuroscience, Environmental Science, Mathematics, Astrophysics, Cognitive Science, and Quantum Computing.
Each domain contains:
- 1,000 full-text research papers with page-aware bounding boxes
- Curated entity pairs linking methodologies to experimental findings
- Cross-domain analogy queries requiring semantic alignment across divergent terminologies.""",

            # Page 2
            """3. METHODOLOGY: DOMAIN-INVARIANT REPRESENTATION LEARNING
To counteract domain shift degradation, we propose InvariantSciNet, an architecture that decouples domain-specific stylistic vocabulary from universal scientific discourse logic (such as hypotheses, methodological formulations, and empirical controls).
We train the encoder using a multi-task objective:
L_total = L_task + lambda_1 * L_adversarial + lambda_2 * L_contrastive
where L_adversarial penalizes the representation if a domain classifier can successfully predict the source scientific field from latent embedding vectors, forcing the representation to learn domain-agnostic semantic geometries.
L_contrastive aligns analogous structural concepts (e.g., 'ablation study' in computer science and 'control group experiment' in clinical medicine) into close latent proximity.

4. EXPERIMENTAL RESULTS ACROSS DOMAINS
Table 2 details cross-domain zero-shot transfer accuracy. 
Standard base models trained on Computer Science achieve 88.5% in-domain F1, but plunge to 52.1% when evaluated on Chemical Engineering and 49.8% on High-Energy Physics. 
In contrast, InvariantSciNet maintains 76.4% on Chemical Engineering and 74.2% on Physics, cutting the cross-domain degradation margin by more than half.
Furthermore, retrieval systems utilizing domain-invariant embeddings achieve 22.3% higher Recall@10 when matching interdisciplinary literature.""",

            # Page 3
            """5. FAILURE MODES AND REPORTED LIMITATIONS
Our error analysis reveals three persistent failure modes:
1. Highly specialized mathematical notation (e.g., Dirac bra-ket notation in Quantum Physics vs. tensor indices in Machine Learning) caused representation collapse in 14.2% of test cases.
2. Acronym collisions: ambiguous acronyms across disciplines (e.g., 'CNN' as Cellular Neural Network in neuroscience vs. Convolutional Neural Network in vision) frequently misdirect retrieval pipelines without explicit document context.
3. Heavy reliance on English-language publications; non-English scientific terminology remains entirely unaddressed in the current benchmark release.

6. CONCLUSION & FUTURE DIRECTIONS
We presented SciCross, demonstrating that cross-domain generalization is a pivotal frontier for AI research assistants. We urge the research community to adopt cross-domain stress-testing as standard protocol for evaluating scientific language models. Future releases will encompass multi-modal figures, tables, and multi-lingual preprints.

REFERENCES
[1] Gupta et al., Interdisciplinary transfer learning in NLP. ACL 2024.
[2] Cohan et al., SPECTER: Document-level representation learning. ACL 2020.
[3] Beltagy et al., SciBERT: A pretrained language model for scientific text. EMNLP 2019."""
        ]
    }
]


class DemoDataLoader:
    """Creates sample research papers and initializes the database and vector index."""

    @classmethod
    def initialize_demo_papers(cls, db: Session):
        """Checks if papers exist; if empty, creates realistic PDFs and indexes them."""
        from app.database.session import Base, engine
        Base.metadata.create_all(bind=engine)

        count = db.query(Paper).count()
        if count > 0:
            logger.info(f"Database already contains {count} papers. Skipping demo seeding.")
            return

        logger.info("Initializing ResearchAI Demo Library with 3 academic research papers...")
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)

        for spec in SAMPLE_PAPERS_SPEC:
            pdf_path = upload_dir / spec["file_name"]

            # Create PDF file using PyMuPDF
            doc = fitz.open()
            for page_text in spec["pages"]:
                page = doc.new_page(width=595, height=842)  # A4 dimensions
                # Draw text neatly onto page
                rect = fitz.Rect(50, 50, 545, 792)
                page.insert_textbox(rect, page_text, fontsize=10, fontname="helv", align=0)

            doc.save(str(pdf_path))
            doc.close()

            # Read bytes for hash
            with open(pdf_path, "rb") as f:
                content = f.read()
            file_hash = hashlib.sha256(content).hexdigest()
            file_size = len(content)

            # Create Paper entry
            paper = Paper(
                title=spec["title"],
                authors=spec["authors"],
                publication_year=spec["year"],
                file_name=spec["file_name"],
                file_path=str(pdf_path),
                file_size=file_size,
                file_hash=file_hash,
                status="PROCESSING"
            )
            db.add(paper)
            db.commit()
            db.refresh(paper)

            # Ingest through pipeline
            try:
                PaperService.ingest_paper_pipeline(paper, db)
                logger.info(f"Demo Paper '{spec['title']}' ingested and indexed successfully.")
            except Exception as e:
                logger.error(f"Failed to ingest demo paper {spec['title']}: {e}", exc_info=True)

        # Trigger topic discovery
        from app.services.topic_service import TopicService
        TopicService.discover_and_link_topics(db)
        logger.info("ResearchAI Demo initialization completed successfully!")
