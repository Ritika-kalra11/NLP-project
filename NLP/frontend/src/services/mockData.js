/**
 * Client-Side Standalone & Offline Data Service.
 * Provides fallback academic data when running as a static deployment on Netlify
 * or when the local Python backend is not connected.
 */

export const mockData = {
  stats: {
    total_papers: 3,
    total_authors: 9,
    indexed_chunks: 41,
    total_conversations: 5,
    embedding_dimensions: 384,
    rag_faithfulness_score: 0.96,
  },

  papers: [
    {
      id: 1,
      title: "Attention Mechanisms and Sparse Transformers for Long-Context Scientific Document Processing",
      authors: "Ashish Vaswani, Lin Chen, David Miller",
      publication_year: 2023,
      page_count: 14,
      abstract: "Addresses the quadratic memory complexity of self-attention mechanisms when applied to long-context scientific papers. Introduces factorized block-sparse attention patterns achieving sub-quadratic O(N sqrt(N)) computational scaling with minimal retention loss.",
      topics: ["Transformers", "Sparse Attention", "Long-Context", "Scientific NLP"],
      topics_rel: [{ name: "Transformers" }, { name: "Sparse Attention" }, { name: "Scientific NLP" }],
      citation_count: 1420,
    },
    {
      id: 2,
      title: "Robust Retrieval-Augmented Generation with Source Citation and Hallucination Mitigation",
      authors: "Patrick Lewis, Maria Rodriguez, Kevin Patel",
      publication_year: 2024,
      page_count: 18,
      abstract: "Presents a verifiable retrieval-augmented generation framework incorporating fine-grained passage attribution and hallucination mitigation mechanisms. Achieves 94.2% attribution fidelity on biomedical and computer science question answering benchmarks.",
      topics: ["RAG", "Factuality", "Hallucination Mitigation", "Dense Retrieval"],
      topics_rel: [{ name: "RAG" }, { name: "Hallucination Mitigation" }, { name: "Dense Retrieval" }],
      citation_count: 412,
    },
    {
      id: 3,
      title: "Cross-Domain Generalization and Evaluation Benchmarks for Scientific NLP Models",
      authors: "Priya Gupta, Min-Jun Kim, Sarah Smith",
      publication_year: 2025,
      page_count: 22,
      abstract: "Introduces standardized multi-disciplinary benchmark datasets evaluating zero-shot transfer and domain generalization across biology, physics, and computer science scholarly corpora.",
      topics: ["Benchmarking", "Domain Generalization", "Evaluation Metrics", "Zero-Shot"],
      topics_rel: [{ name: "Benchmarking" }, { name: "Domain Generalization" }, { name: "Evaluation Metrics" }],
      citation_count: 195,
    },
  ],

  authors: [
    { name: "Ashaq Hussain Bhat", papers_count: 3, estimated_citations: 116, h_index: 4, topics: ["Predictive Modeling", "Machine Learning", "Behavioral Analytics", "Healthcare Informatics"] },
    { name: "Ashish Vaswani", papers_count: 1, estimated_citations: 1420, h_index: 24, topics: ["Transformers", "Sparse Attention", "Sequence Modeling"] },
    { name: "Patrick Lewis", papers_count: 1, estimated_citations: 8900, h_index: 18, topics: ["RAG", "Dense Passage Retrieval", "QA"] },
    { name: "Priya Gupta", papers_count: 1, estimated_citations: 580, h_index: 7, topics: ["Benchmarking", "Domain Generalization", "Evaluation"] },
    { name: "Lin Chen", papers_count: 1, estimated_citations: 450, h_index: 6, topics: ["Efficient Attention", "Linear Transformers"] },
    { name: "Kevin Patel", papers_count: 1, estimated_citations: 380, h_index: 5, topics: ["Citation Verification", "RAG"] },
  ],

  getCitationSearch(query) {
    const q = (query || "").trim().toLowerCase();
    const isBhat = q.includes("bhat") || q.includes("ashaq");
    const isLewis = q.includes("lewis") || q.includes("rag");
    const isGupta = q.includes("gupta") || q.includes("benchmark") || q.includes("generalization");

    if (isBhat) {
      const seedTitle = "Predictive Modeling of Drug Addiction Using Socio-Psychological and Behavioral Data";
      const authorName = "Ashaq Hussain Bhat";
      return {
        found: true,
        query: query,
        matched_type: "author",
        is_external: true,
        author_profile: {
          name: authorName,
          affiliation: "AI & Machine Learning Researcher",
          papers_count: 3,
          estimated_citations: 116,
          h_index: 4,
          collaborators: ["Dr. M. A. Lone", "Prof. S. R. Wani", "F. Ahmad", "A. R. Dar"],
          topics: ["Predictive Modeling", "Machine Learning", "Behavioral Analytics", "Privacy Preservation", "Healthcare Informatics"],
          papers: [
            { id: 101, title: seedTitle, year: 2025, citations: 92 },
            { id: 102, title: "A Comprehensive Review of Privacy Preservation Framework using Birch and K-Means Algorithm", year: 2018, citations: 14 },
            { id: 103, title: "Sick: A Search Focused Android Launcher - Feature Analysis and Information Retrieval", year: 2025, citations: 10 },
          ],
        },
        seed_paper: {
          id: null,
          title: seedTitle,
          authors: "Ashaq Hussain Bhat, et al.",
          year: 2025,
          abstract: "Investigates predictive behavioral analytics and multi-variable classification models applied to socio-psychological cohorts. Employs ensemble learning, hyperparameter tuning, and feature selection to derive high-accuracy risk indicators and decision-support metrics.",
          page_count: 12,
          topics: ["Predictive Modeling", "Machine Learning", "Behavioral Analytics", "Clinical Data Mining"],
          citations_count: 92,
        },
        earlier_work: [
          {
            id: "ext_breiman_2001",
            title: "Random Forests: Ensemble Learning for Classification and Regression",
            authors: "Leo Breiman",
            year: 2001,
            citations: 114200,
            relationship: "Foundational Methodology",
            context: "Theoretical ensemble bagging and decision forest formulation leveraged for behavioral feature modeling.",
            topics: ["Ensemble Learning", "Random Forest", "Supervised Learning"],
            work_timeline: "earlier",
          },
          {
            id: "ext_pedregosa_2011",
            title: "Scikit-learn: Machine Learning in Python",
            authors: "Fabian Pedregosa, Gael Varoquaux, Alexandre Gramfort, et al.",
            year: 2011,
            citations: 86500,
            relationship: "Algorithmic Implementation",
            context: "Core computing library utilized for multi-variate hyperparameter optimization and cross-validation pipelines.",
            topics: ["Machine Learning", "Python", "Data Science"],
            work_timeline: "earlier",
          },
          {
            id: "ext_macqueen_1967",
            title: "Some Methods for Classification and Analysis of Multivariate Observations",
            authors: "J. MacQueen",
            year: 1967,
            citations: 48000,
            relationship: "Clustering Baseline",
            context: "Original k-means clustering formulation leveraged for patient profiling and behavioral cohort grouping.",
            topics: ["Clustering", "K-Means", "Unsupervised Learning"],
            work_timeline: "earlier",
          },
          {
            id: "ext_chen_2016",
            title: "XGBoost: A Scalable Tree Boosting System",
            authors: "Tianqi Chen, Carlos Guestrin",
            year: 2016,
            citations: 34800,
            relationship: "Gradient Boosting Baseline",
            context: "Gradient-boosted decision trees utilized for non-linear risk factor ranking and comparison.",
            topics: ["Gradient Boosting", "XGBoost", "High-Dimensional Data"],
            work_timeline: "earlier",
          },
        ],
        future_work: [
          {
            id: "ext_rahman_2025",
            title: "Deep Graph Neural Networks for Longitudinal Behavioral Health Risk Prediction",
            authors: "T. Rahman, Ashaq Hussain Bhat, S. Ahmed",
            year: 2025,
            citations: 18,
            relationship: "Subsequent Citing Work",
            context: "Builds directly upon the feature extraction methodology of Bhat et al. (2025) to map temporal patient graph interactions.",
            topics: ["Graph Neural Networks", "Behavioral Health", "Risk Prediction"],
            work_timeline: "future",
          },
          {
            id: "ext_tariq_2026",
            title: "Federated Multi-Hospital Predictive Analytics for Socio-Clinical Indicators",
            authors: "M. Tariq, K. Sharma, Y. Farooq",
            year: 2026,
            citations: 8,
            relationship: "Derivative Application",
            context: "Applies the predictive indicators from Bhat et al. (2025) within decentralized privacy-preserving federated nodes.",
            topics: ["Federated Learning", "Healthcare Analytics", "Privacy"],
            work_timeline: "future",
          },
          {
            id: "ext_dar_2026",
            title: "Autonomous Clinical Screening Agents with Predictive Risk Grounding",
            authors: "A. R. Dar, Z. Malik, Ashaq Hussain Bhat",
            year: 2026,
            citations: 5,
            relationship: "Subsequent Citing Work",
            context: "Integrates the 2025 predictive modeling framework into conversational triage systems for clinical intake.",
            topics: ["Conversational AI", "Clinical NLP", "Predictive Grounding"],
            work_timeline: "future",
          },
        ],
        nodes: [
          { id: "seed", title: seedTitle, authors: "Ashaq Hussain Bhat, et al.", year: 2025, citations_count: 92, node_type: "seed", work_timeline: "seed", x: 410, y: 240, abstract: "Investigates predictive behavioral analytics...", in_library: false },
          { id: "ext_breiman_2001", title: "Random Forests", authors: "Leo Breiman", year: 2001, citations_count: 114200, node_type: "reference", work_timeline: "earlier", x: 120, y: 140, relationship: "Foundational Methodology", context: "Theoretical ensemble bagging formulation...", in_library: false },
          { id: "ext_pedregosa_2011", title: "Scikit-learn in Python", authors: "Fabian Pedregosa, et al.", year: 2011, citations_count: 86500, node_type: "reference", work_timeline: "earlier", x: 220, y: 320, relationship: "Algorithmic Implementation", context: "Core computing library utilized...", in_library: false },
          { id: "ext_macqueen_1967", title: "Multivariate Classification", authors: "J. MacQueen", year: 1967, citations_count: 48000, node_type: "reference", work_timeline: "earlier", x: 90, y: 360, relationship: "Clustering Baseline", context: "Original k-means clustering formulation...", in_library: false },
          { id: "ext_chen_2016", title: "XGBoost System", authors: "Tianqi Chen, et al.", year: 2016, citations_count: 34800, node_type: "reference", work_timeline: "earlier", x: 270, y: 170, relationship: "Gradient Boosting Baseline", context: "Gradient-boosted decision trees...", in_library: false },
          { id: "ext_rahman_2025", title: "Deep Graph Neural Networks", authors: "T. Rahman, Ashaq Hussain Bhat, et al.", year: 2025, citations_count: 18, node_type: "citing", work_timeline: "future", x: 620, y: 180, relationship: "Subsequent Citing Work", context: "Builds directly upon Bhat et al. (2025)...", in_library: false },
          { id: "ext_tariq_2026", title: "Federated Healthcare Analytics", authors: "M. Tariq, et al.", year: 2026, citations_count: 8, node_type: "citing", work_timeline: "future", x: 720, y: 300, relationship: "Derivative Application", context: "Applies predictive indicators in federated nodes...", in_library: false },
          { id: "ext_dar_2026", title: "Autonomous Clinical Screening", authors: "A. R. Dar, Z. Malik, Ashaq Hussain Bhat", year: 2026, citations_count: 5, node_type: "citing", work_timeline: "future", x: 740, y: 150, relationship: "Subsequent Citing Work", context: "Integrates framework into conversational triage...", in_library: false },
        ],
        links: [
          { source: "seed", target: "ext_breiman_2001", relationship: "cites" },
          { source: "seed", target: "ext_pedregosa_2011", relationship: "cites" },
          { source: "seed", target: "ext_macqueen_1967", relationship: "cites" },
          { source: "seed", target: "ext_chen_2016", relationship: "cites" },
          { source: "ext_rahman_2025", target: "seed", relationship: "cites" },
          { source: "ext_tariq_2026", target: "seed", relationship: "cites" },
          { source: "ext_dar_2026", target: "seed", relationship: "cites" },
        ],
        total_nodes: 8,
        total_links: 7,
      };
    }

    // Dynamic fallback for any queried author or topic (Vaswani or arbitrary author)
    const cleanedQuery = (query || "Ashish Vaswani").trim();
    const isVaswani = q.includes("vaswani") || q.includes("attention");
    const authorName = isVaswani
      ? "Ashish Vaswani"
      : cleanedQuery.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

    const seedTitle = isVaswani
      ? "Attention Mechanisms and Sparse Transformers for Long-Context Scientific Document Processing"
      : `Empirical Evaluations and Scalable Deep Architectures by ${authorName}`;

    const authorPapers = isVaswani
      ? [{ id: 1, title: seedTitle, year: 2023, citations: 1420 }]
      : [
          { id: "p1", title: seedTitle, year: 2024, citations: 142 },
          { id: "p2", title: "Multi-Variable Modeling and Optimization Protocols in Distributed Systems", year: 2023, citations: 76 },
          { id: "p3", title: "Robust Decision-Support Architectures for Data-Intensive Applications", year: 2022, citations: 38 },
        ];

    return {
      found: true,
      query: query || authorName,
      matched_type: "author",
      is_external: !isVaswani,
      author_profile: {
        name: authorName,
        affiliation: isVaswani ? "Senior AI/ML Researcher & Author" : "Academic AI & Computing Researcher",
        papers_count: authorPapers.length,
        estimated_citations: authorPapers.reduce((acc, p) => acc + (p.citations || 0), 0),
        h_index: isVaswani ? 24 : 8,
        collaborators: isVaswani ? ["Lin Chen", "David Miller", "Noam Shazeer"] : ["Dr. A. Sharma", "Prof. R. Patel", "M. Johnson"],
        topics: isVaswani ? ["Transformers", "Self-Attention", "Sequence Modeling"] : ["Machine Learning", "Optimization", "Predictive Analytics"],
        papers: authorPapers,
      },
      seed_paper: {
        id: isVaswani ? 1 : null,
        title: seedTitle,
        authors: isVaswani ? "Ashish Vaswani, Lin Chen, David Miller" : `${authorName}, et al.`,
        year: isVaswani ? 2023 : 2024,
        abstract: isVaswani
          ? "Addresses the quadratic memory complexity of self-attention mechanisms when applied to long-context scientific papers. Introduces factorized block-sparse attention patterns."
          : `Comprehensive empirical investigation authored by ${authorName} evaluating machine learning architectures, data distributions, and predictive benchmarks.`,
        page_count: 14,
        topics: isVaswani ? ["Transformers", "Sparse Attention", "Scientific NLP"] : ["Machine Learning", "Scalable Computing"],
        citations_count: authorPapers[0].citations,
      },
      earlier_work: [
        {
          id: "ext_vaswani_2017",
          title: "Attention Is All You Need",
          authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar, et al.",
          year: 2017,
          citations: 128400,
          relationship: "Foundational Reference",
          context: "Introduced the original multi-head self-attention Transformer architecture.",
          topics: ["Transformers", "Self-Attention"],
          work_timeline: "earlier",
        },
        {
          id: "ext_child_2019",
          title: "Generating Long Sequences with Sparse Transformers",
          authors: "Rewon Child, Scott Gray, Alec Radford, Ilya Sutskever",
          year: 2019,
          citations: 2840,
          relationship: "Prior Methodology",
          context: "Factorized self-attention patterns reducing complexity from O(N^2) to O(N sqrt(N)).",
          topics: ["Sparse Attention"],
          work_timeline: "earlier",
        },
        {
          id: "ext_beltagy_2020",
          title: "Longformer: The Long-Document Transformer",
          authors: "Iz Beltagy, Matthew E. Peters, Arman Cohan",
          year: 2020,
          citations: 5620,
          relationship: "Baseline Comparison",
          context: "Sliding window combined with global attention for scaling to 4,096 tokens.",
          topics: ["Long-Context", "Scientific Documents"],
          work_timeline: "earlier",
        },
      ],
      future_work: [
        {
          id: "ext_zaheer_2024",
          title: "BigBird-Next: Linear Attention with Dynamic Block Sparsity",
          authors: "Manzil Zaheer, Amr Ahmed, Lin Chen",
          year: 2024,
          citations: 185,
          relationship: "Subsequent Citing Work",
          context: "Builds upon the block-sparse factorized matrices proposed in Vaswani et al. (2023).",
          topics: ["Linear Attention", "Document Classification"],
          work_timeline: "future",
        },
        {
          id: "local_2",
          title: "Robust Retrieval-Augmented Generation with Source Citation and Hallucination Mitigation",
          authors: "Patrick Lewis, Maria Rodriguez, Kevin Patel",
          year: 2024,
          citations: 412,
          relationship: "Cross-Corpus Citation",
          context: "Adopts the sparse scientific document encoder as the dense retrieval backbone.",
          topics: ["RAG", "Dense Retrieval"],
          work_timeline: "future",
        },
      ],
      nodes: [
        { id: "seed", title: seedTitle, authors: "Ashish Vaswani, et al.", year: 2023, citations_count: 1420, node_type: "seed", work_timeline: "seed", x: 410, y: 240, abstract: "Addresses quadratic memory complexity...", in_library: true, paper_id: 1 },
        { id: "ext_vaswani_2017", title: "Attention Is All You Need", authors: "Ashish Vaswani, et al.", year: 2017, citations_count: 128400, node_type: "reference", work_timeline: "earlier", x: 120, y: 160, relationship: "Foundational Reference", context: "Introduced Transformer architecture...", in_library: false },
        { id: "ext_child_2019", title: "Generating Long Sequences", authors: "Rewon Child, et al.", year: 2019, citations_count: 2840, node_type: "reference", work_timeline: "earlier", x: 220, y: 320, relationship: "Prior Methodology", context: "Factorized self-attention patterns...", in_library: false },
        { id: "ext_beltagy_2020", title: "Longformer: Long-Document", authors: "Iz Beltagy, et al.", year: 2020, citations_count: 5620, node_type: "reference", work_timeline: "earlier", x: 270, y: 180, relationship: "Baseline Comparison", context: "Sliding window attention...", in_library: false },
        { id: "ext_zaheer_2024", title: "BigBird-Next: Linear Attention", authors: "Manzil Zaheer, et al.", year: 2024, citations_count: 185, node_type: "citing", work_timeline: "future", x: 620, y: 190, relationship: "Subsequent Citing Work", context: "Builds upon block-sparse matrices...", in_library: false },
        { id: "local_2", title: "Robust Retrieval-Augmented Generation", authors: "Patrick Lewis, et al.", year: 2024, citations_count: 412, node_type: "citing", work_timeline: "future", x: 690, y: 320, relationship: "Cross-Corpus Citation", context: "Adopts sparse document encoder...", in_library: true, paper_id: 2 },
      ],
      links: [
        { source: "seed", target: "ext_vaswani_2017", relationship: "cites" },
        { source: "seed", target: "ext_child_2019", relationship: "cites" },
        { source: "seed", target: "ext_beltagy_2020", relationship: "cites" },
        { source: "ext_zaheer_2024", target: "seed", relationship: "cites" },
        { source: "local_2", target: "seed", relationship: "cites" },
      ],
      total_nodes: 6,
      total_links: 5,
    };
  },

  getKnowledgeGraph() {
    return {
      nodes: [
        { id: "p1", label: "Sparse Transformers", type: "paper", size: 24 },
        { id: "p2", label: "Robust RAG", type: "paper", size: 22 },
        { id: "p3", label: "Generalization Benchmarks", type: "paper", size: 20 },
        { id: "a1", label: "Ashish Vaswani", type: "author", size: 18 },
        { id: "a2", label: "Patrick Lewis", type: "author", size: 18 },
        { id: "a3", label: "Ashaq Hussain Bhat", type: "author", size: 18 },
        { id: "m1", label: "Self-Attention", type: "model", size: 16 },
        { id: "m2", label: "Dense Retriever", type: "model", size: 16 },
        { id: "d1", label: "Scientific NLP", type: "domain", size: 26 },
        { id: "d2", label: "Healthcare AI", type: "domain", size: 24 },
      ],
      links: [
        { source: "a1", target: "p1", relationship: "authored" },
        { source: "a2", target: "p2", relationship: "authored" },
        { source: "a3", target: "d2", relationship: "researches" },
        { source: "p1", target: "m1", relationship: "implements" },
        { source: "p2", target: "m2", relationship: "implements" },
        { source: "p1", target: "d1", relationship: "belongs_to" },
        { source: "p2", target: "d1", relationship: "belongs_to" },
        { source: "p2", target: "p1", relationship: "cites" },
      ],
    };
  },

  getTimeline() {
    return [
      {
        year: 2023,
        milestones: [
          {
            paper_id: 1,
            title: "Attention Mechanisms and Sparse Transformers for Long-Context Scientific Document Processing",
            authors: "Ashish Vaswani, Lin Chen, David Miller",
            significance: "Pioneered sub-quadratic factorized attention for 32k+ token academic documents.",
          },
        ],
      },
      {
        year: 2024,
        milestones: [
          {
            paper_id: 2,
            title: "Robust Retrieval-Augmented Generation with Source Citation and Hallucination Mitigation",
            authors: "Patrick Lewis, Maria Rodriguez, Kevin Patel",
            significance: "Established fine-grained sentence-level passage attribution reducing hallucinations to <5%.",
          },
        ],
      },
      {
        year: 2025,
        milestones: [
          {
            paper_id: 3,
            title: "Cross-Domain Generalization and Evaluation Benchmarks for Scientific NLP Models",
            authors: "Priya Gupta, Min-Jun Kim, Sarah Smith",
            significance: "Standardized multi-disciplinary zero-shot evaluation protocols.",
          },
          {
            paper_id: 101,
            title: "Predictive Modeling of Drug Addiction Using Socio-Psychological and Behavioral Data",
            authors: "Ashaq Hussain Bhat, et al.",
            significance: "High-accuracy multi-variable predictive modeling and decision-support metrics.",
          },
        ],
      },
    ];
  },

  getChatResponse(prompt) {
    return {
      response: `Based on the literature in the corpus, **${prompt.slice(0, 50)}...** relates to key findings in scientific NLP and machine learning architectures. The primary methodology involves balancing computational efficiency with rigorous factual attribution.`,
      sources: [
        {
          paper_id: 1,
          paper_title: "Attention Mechanisms and Sparse Transformers",
          page_number: 4,
          relevance_score: 0.94,
          citation_text: "Factorized block-sparse self-attention reduces memory footprint while preserving semantic fidelity across document segments.",
        },
      ],
    };
  },
};
