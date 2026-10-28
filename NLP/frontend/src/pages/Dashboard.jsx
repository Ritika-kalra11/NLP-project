import React, { useEffect, useState } from 'react';
import {
  FileText,
  MessageSquare,
  Sparkles,
  Search,
  Scale,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  Layers,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Compass,
  Zap,
  GitFork,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { api } from '../services/api';

export const Dashboard = ({
  setActiveTab,
  onOpenUpload,
  onOpenViewer,
  onOpenSummary,
  onStartChat,
  onSelectForCompare,
  onSearchTopic,
  refreshTrigger,
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = (stats?.topics || []).map((t) => ({
    name: t.name.length > 22 ? t.name.slice(0, 22) + '...' : t.name,
    fullName: t.name,
    count: t.paper_count,
  }));

  const COLORS = ['#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#ec4899'];

  const quickPrompts = [
    { text: "What methodology does Paper 1 propose for self-attention?", topic: "Methodology" },
    { text: "How do these papers mitigate hallucinations in RAG?", topic: "Hallucination" },
    { text: "Compare the benchmark datasets used across studies", topic: "Datasets" },
    { text: "What are the common limitations reported by the authors?", topic: "Limitations" },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-brand-700 to-slate-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-teal-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>AI Research Paper Companion • Hybrid RAG Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Synthesize, Search & Audit Academic Papers
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
            Multi-document NLP & Hybrid RAG architecture with structure-aware chunking,
            verifiable source citations, and cross-paper gap discovery.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('chat')}
              className="px-4 py-2 rounded-xl bg-white text-brand-800 font-bold text-xs shadow-md hover:bg-teal-50 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Ask ResearchAI</span>
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs border border-white/25 backdrop-blur-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload PDF Papers</span>
            </button>
            <button
              onClick={() => setActiveTab('citations')}
              className="px-4 py-2 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 text-white font-semibold text-xs border border-teal-300/30 backdrop-blur-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <GitFork className="w-4 h-4 text-teal-200" />
              <span>Citation Map</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <FileText className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Clickable Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uploaded Papers */}
        <div
          onClick={() => setActiveTab('papers')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-brand-600 transition-colors">
              Uploaded Papers
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {loading ? '...' : stats?.total_papers || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>View Library</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pages */}
        <div
          onClick={() => setActiveTab('papers')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-sky-600 transition-colors">
              Total Pages
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {loading ? '...' : stats?.total_pages || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Page-level vectors</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Indexed Chunks */}
        <div
          onClick={() => setActiveTab('search')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">
              Indexed Chunks
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {loading ? '...' : stats?.indexed_chunks || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>FAISS + BM25</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Conversations */}
        <div
          onClick={() => setActiveTab('chat')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-teal-600 transition-colors">
              Conversations
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {loading ? '...' : stats?.total_conversations || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Grounded QA logs</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* One-Click Research Prompts */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            One-Click Research Prompts (Try Instantly)
          </span>
          <button
            onClick={() => setActiveTab('chat')}
            className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Open Custom Chat</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onStartChat(null, q.text)}
              className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-brand-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 text-left transition-all group flex flex-col justify-between"
            >
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                "{q.text}"
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 font-medium">
                  {q.topic}
                </span>
                <span className="text-brand-600 dark:text-brand-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Ask →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Research Modules & Workflows
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            onClick={onOpenUpload}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
              Upload Papers
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Add new PDF documents to the indexed vector database.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
              Ask ResearchAI
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Query papers with page-precise verifiable citations.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
              Compare Papers
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Side-by-side matrices and contradiction auditing.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('gaps')}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
              Research Gaps
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Discover underexplored areas backed by evidence.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
              Semantic Search
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-colors" />
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Hybrid dense & sparse BM25 passage retrieval.
            </p>
          </button>
        </div>
      </div>

      {/* Two-Column Layout: Topic Distribution & Recent Papers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Topics Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Detected Topics
              </h3>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                Click bar to search
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Distribution across indexed documents</p>
          </div>

          <div className="h-60 w-full cursor-pointer">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  onClick={(state) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const topicObj = state.activePayload[0].payload;
                      onSearchTopic(topicObj.fullName);
                    }
                  }}
                >
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: '#94a3b8' }} width={125} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No topic metadata available
              </div>
            )}
          </div>

          {/* Clickable Topic Tags */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
            {stats?.topics?.slice(0, 4).map((t) => (
              <button
                key={t.id}
                onClick={() => onSearchTopic(t.name)}
                className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 transition-colors"
              >
                #{t.name.split(' ')[0]} ({t.paper_count})
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Papers */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Recently Indexed Papers
              </h3>
              <p className="text-xs text-slate-400">Quick actions for your research library</p>
            </div>
            <button
              onClick={() => setActiveTab('papers')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recent_papers?.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {p.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {p.year || 2024} • {p.page_count} pages
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {p.authors}
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onOpenViewer(p.id, 1)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                    <span>Read</span>
                  </button>

                  <button
                    onClick={() => onOpenSummary(p)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Summary</span>
                  </button>

                  <button
                    onClick={() => onStartChat(p.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => onSelectForCompare([p.id])}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <Scale className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Compare</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
