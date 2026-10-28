import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  Sparkles,
  Sliders,
  Layers,
  ArrowRight,
  Clock,
  FileText,
  Copy,
  Check,
  MessageSquare,
  X,
} from 'lucide-react';
import { api } from '../services/api';

export const SemanticSearch = ({ onOpenViewer, onStartChat, initialQuery = '', showToast }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [mode, setMode] = useState('hybrid'); // 'hybrid', 'semantic', 'keyword'
  const [topK, setTopK] = useState(10);
  const [threshold, setThreshold] = useState(0.15);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState(null);
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState('');

  useEffect(() => {
    loadPapers();
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const loadPapers = async () => {
    try {
      const data = await api.getPapers();
      setPapers(data);
    } catch (err) {
      console.error('Failed to load papers for search filter:', err);
    }
  };

  const handleSearch = async (overrideQuery = null) => {
    const q = (overrideQuery || query).trim();
    if (!q) return;

    setLoading(true);
    try {
      const data = await api.search({
        query: q,
        mode,
        paper_id: selectedPaperId ? parseInt(selectedPaperId) : null,
        top_k: parseInt(topK),
        similarity_threshold: parseFloat(threshold),
      });
      setResults(data);
      if (showToast) showToast(`Found ${data.total_results} matching passages`, 'info');
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const copySnippet = (res, idx) => {
    const text = `"${res.text}"\n— [${res.paper_title}, Page ${res.page_number} (${res.section_name})]`;
    navigator.clipboard.writeText(text);
    setCopiedSnippetIndex(idx);
    if (showToast) showToast('Passage and citation copied to clipboard!', 'success');
    setTimeout(() => setCopiedSnippetIndex(null), 2000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-500" />
          <span>Semantic & Hybrid Literature Search</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Execute dense vector similarity, sparse BM25 lexical search, or combined Reciprocal Rank Fusion (RRF)
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center"
        >
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search literature in natural language (e.g., 'attention mechanisms for long document processing')..."
            className="w-full pl-12 pr-28 py-3.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-40 active:scale-95"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Quick Query Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Popular queries:
          </span>
          {[
            'sparse attention linear complexity',
            'retrieval augmented generation hallucination',
            'cross-domain generalization benchmark',
            'scidocs evaluation dataset',
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(item);
                handleSearch(item);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-600 dark:text-slate-300 hover:text-brand-700 text-[11px] font-medium transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Search Parameter Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Engine Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Retrieval Engine:</span>
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 p-0.5">
              {[
                { id: 'hybrid', label: 'Hybrid (RRF)' },
                { id: 'semantic', label: 'Dense (FAISS)' },
                { id: 'keyword', label: 'Lexical (BM25)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    mode === m.id
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Scope & Sliders */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Scope:</span>
              <select
                value={selectedPaperId}
                onChange={(e) => setSelectedPaperId(e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 max-w-[160px] truncate"
              >
                <option value="">All Papers</option>
                {papers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Top-K:</span>
              <select
                value={topK}
                onChange={(e) => setTopK(e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Min Similarity:</span>
              <select
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="0.10">0.10 (Broad)</option>
                <option value="0.15">0.15 (Balanced)</option>
                <option value="0.25">0.25 (Strict)</option>
                <option value="0.35">0.35 (Exact)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Stream */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs">Searching indexed vector space & ranking passages...</p>
        </div>
      ) : results ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Found <strong>{results.total_results}</strong> matching passages using <strong>{results.mode.toUpperCase()}</strong> retrieval
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {results.execution_time_ms} ms
            </span>
          </div>

          <div className="space-y-3">
            {results.results.map((res, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-500/50 transition-all space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {res.paper_title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>Page {res.page_number}</span>
                      <span>•</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {res.section_name}
                      </span>
                      {res.authors && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-xs">{res.authors}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      Score: {Math.round(res.score * 100)}%
                    </span>
                    <button
                      onClick={() => onOpenViewer(res.paper_id, res.page_number, res.text.slice(0, 40))}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                      title="Open page in PDF viewer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                      <span>Page {res.page_number}</span>
                    </button>
                  </div>
                </div>

                <p className="font-serif leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[12.5px]">
                  "{res.text}"
                </p>

                {/* Direct Action Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copySnippet(res, i)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                    >
                      {copiedSnippetIndex === i ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedSnippetIndex === i ? 'Copied' : 'Copy Passage'}</span>
                    </button>

                    <button
                      onClick={() =>
                        onStartChat(
                          res.paper_id,
                          `Based on section "${res.section_name}" (Page ${res.page_number}) of "${res.paper_title}", explain the significance of: "${res.text.slice(0, 100)}..."`
                        )
                      }
                      className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline font-semibold ml-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat About This Passage</span>
                    </button>
                  </div>

                  <span className="text-slate-400 text-[10px]">Chunk #{res.chunk_id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-2">
          <Search className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
            Search Scientific Corpus
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Type any research question, methodology term, or concept to retrieve matching passages.
          </p>
        </div>
      )}
    </div>
  );
};
