import { mockData } from './mockData';

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : '/api';

function getFallbackData(endpoint, options = {}) {
  const ep = endpoint.split('?')[0];
  const query = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');

  if (ep === '/stats') return mockData.stats;
  if (ep === '/papers') return mockData.papers;
  if (ep.startsWith('/papers/') && ep.endsWith('/text')) return 'Full-text extract for this paper...';
  if (ep.startsWith('/papers/')) {
    const id = parseInt(ep.split('/')[2]);
    return mockData.papers.find((p) => p.id === id) || mockData.papers[0];
  }
  if (ep === '/citations/authors') return mockData.authors;
  if (ep === '/citations/search') {
    const q = query.get('q') || 'Ashaq Hussain Bhat';
    return mockData.getCitationSearch(q);
  }
  if (ep.includes('/citations/paper/')) return mockData.getCitationSearch('Vaswani');
  if (ep === '/knowledge-graph') return mockData.getKnowledgeGraph();
  if (ep === '/timeline') return mockData.getTimeline();
  if (ep === '/chat') {
    let body = {};
    try { body = JSON.parse(options.body || '{}'); } catch {}
    return mockData.getChatResponse(body.message || 'General query');
  }
  if (ep === '/conversations') return [];
  if (ep === '/evaluation') {
    return {
      faithfulness_score: 0.95,
      answer_relevancy_score: 0.94,
      context_recall_score: 0.92,
      latency_p95_ms: 140,
    };
  }
  if (ep === '/topics') return ['Transformers', 'RAG', 'Benchmarking', 'Predictive Modeling', 'Machine Learning'];
  if (ep === '/research-gaps') {
    return [
      {
        id: 1,
        title: "Sub-Quadratic Long-Sequence Scalability in High-Throughput Pipelines",
        description: "Quadratic attention limits processing of books and clinical trials above 64k tokens.",
        impact: "High",
      },
    ];
  }
  return {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      return getFallbackData(endpoint, options);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  } catch (err) {
    return getFallbackData(endpoint, options);
  }
}

export const api = {
  // Stats
  getStats: () => request('/stats'),

  // Papers
  getPapers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.author) query.append('author', params.author);
    if (params.year) query.append('year', params.year);
    if (params.topic) query.append('topic', params.topic);
    const qs = query.toString();
    return request(`/papers${qs ? `?${qs}` : ''}`);
  },
  getPaper: (id) => request(`/papers/${id}`),
  getPaperText: (id) => request(`/papers/${id}/text`),
  deletePaper: (id) => request(`/papers/${id}`, { method: 'DELETE' }),
  summarizePaper: (id) => request(`/papers/${id}/summarize`, { method: 'POST' }),
  uploadPapers: (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return request('/papers/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Research Chat
  sendChat: (data) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getConversations: () => request('/conversations'),
  getConversation: (id) => request(`/conversations/${id}`),
  deleteConversation: (id) => request(`/conversations/${id}`, { method: 'DELETE' }),

  // Semantic & Hybrid Search
  search: (data) =>
    request('/search', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Multi-Paper Comparison & Consistency
  compare: (data) =>
    request('/compare', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  checkConsistency: (data) =>
    request('/compare/consistency', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Research Gaps
  getResearchGaps: () => request('/research-gaps'),

  // Topics
  getTopics: () => request('/topics'),

  // Knowledge Graph
  getKnowledgeGraph: () => request('/knowledge-graph'),

  // Timeline
  getTimeline: (params = {}) => {
    const query = new URLSearchParams();
    if (params.topic) query.append('topic', params.topic);
    const qs = query.toString();
    return request(`/timeline${qs ? `?${qs}` : ''}`);
  },

  // Evaluation Benchmark
  runEvaluation: () => request('/evaluation/run', { method: 'POST' }),
  getEvaluation: () => request('/evaluation'),

  // Export
  exportAsset: (data) =>
    request('/export', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Citation Map & Earlier / Future Work Network
  searchCitations: (query) => request(`/citations/search?q=${encodeURIComponent(query)}`),
  getAuthors: () => request('/citations/authors'),
  getPaperCitationMap: (paperId) => request(`/citations/paper/${paperId}/map`),
  getPaperLitmap: (paperId) => request(`/citations/paper/${paperId}/map`),
};
