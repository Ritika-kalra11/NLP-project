import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Trash2,
  BookOpen,
  Sparkles,
  MessageSquare,
  Scale,
  Calendar,
  User,
  Tag,
  UploadCloud,
  RefreshCw,
  CheckSquare,
  Square,
  ArrowUpDown,
  X,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

export const PaperLibrary = ({
  onOpenViewer,
  onOpenSummary,
  onStartChatWithPaper,
  onSelectForCompare,
  onOpenUpload,
  refreshTrigger,
  showToast,
}) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title', 'pages'
  const [selectedPaperIds, setSelectedPaperIds] = useState([]);

  useEffect(() => {
    fetchPapers();
  }, [searchTerm, authorFilter, yearFilter, topicFilter, refreshTrigger]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const data = await api.getPapers({
        search: searchTerm,
        author: authorFilter,
        year: yearFilter ? parseInt(yearFilter) : undefined,
        topic: topicFilter,
      });
      setPapers(data);
    } catch (err) {
      console.error('Failed to load papers:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setAuthorFilter('');
    setYearFilter('');
    setTopicFilter('');
  };

  const hasActiveFilters = Boolean(searchTerm || authorFilter || yearFilter || topicFilter);

  // Sorting
  const sortedPapers = [...papers].sort((a, b) => {
    if (sortBy === 'newest') return (b.publication_year || 0) - (a.publication_year || 0);
    if (sortBy === 'oldest') return (a.publication_year || 0) - (b.publication_year || 0);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'pages') return (b.page_count || 0) - (a.page_count || 0);
    return 0;
  });

  const toggleSelectPaper = (id, e) => {
    e.stopPropagation();
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllPapers = () => {
    if (selectedPaperIds.length === sortedPapers.length) {
      setSelectedPaperIds([]);
    } else {
      setSelectedPaperIds(sortedPapers.map((p) => p.id));
    }
  };

  const handleDelete = async (paperId, paperTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${paperTitle}" and all its indexed vector chunks?`)) {
      return;
    }
    try {
      await api.deletePaper(paperId);
      setPapers((prev) => prev.filter((p) => p.id !== paperId));
      setSelectedPaperIds((prev) => prev.filter((id) => id !== paperId));
      if (showToast) showToast('Paper and vector chunks deleted.', 'info');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`Delete ${selectedPaperIds.length} selected papers and their vector chunks?`)) {
      return;
    }
    try {
      for (const id of selectedPaperIds) {
        await api.deletePaper(id);
      }
      setPapers((prev) => prev.filter((p) => !selectedPaperIds.includes(p.id)));
      setSelectedPaperIds([]);
      if (showToast) showToast(`Deleted ${selectedPaperIds.length} papers.`, 'info');
    } catch (err) {
      alert(`Batch delete error: ${err.message}`);
    }
  };

  const handleBatchCompare = () => {
    if (selectedPaperIds.length < 2) {
      if (showToast) showToast('Please select at least 2 papers to compare.', 'error');
      return;
    }
    onSelectForCompare(selectedPaperIds);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Scientific Paper Library</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Indexed academic literature with page-level semantic vectors ({papers.length} documents)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPapers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Papers</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title or text..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Filter Author */}
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              placeholder="Filter by author..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Filter Year */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              placeholder="Filter by year (e.g. 2024)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Filter Topic */}
          <div className="relative">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              placeholder="Filter by topic..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Second Row: Sort & Filter Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAllPapers}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-brand-600 font-semibold"
            >
              {selectedPaperIds.length > 0 && selectedPaperIds.length === sortedPapers.length ? (
                <CheckSquare className="w-4 h-4 text-brand-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedPaperIds.length === sortedPapers.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="pages">Page Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar when items selected */}
      {selectedPaperIds.length > 0 && (
        <div className="p-3 px-5 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-150">
          <span className="text-xs font-semibold text-slate-200">
            {selectedPaperIds.length} paper{selectedPaperIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchCompare}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedPaperIds.length})</span>
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Paper Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs">Loading library documents...</p>
        </div>
      ) : sortedPapers.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            No Research Papers Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try clearing your search filters or upload a new PDF document.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
          >
            Upload New Paper
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedPapers.map((paper) => {
            const isSelected = selectedPaperIds.includes(paper.id);
            return (
              <div
                key={paper.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-brand-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-brand-500/50'
                }`}
              >
                <div>
                  {/* Top Bar: Select Checkbox & Status */}
                  <div className="flex items-center justify-between mb-3 text-[11px]">
                    <button
                      onClick={(e) => toggleSelectPaper(paper.id, e)}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      <span className="font-semibold">{isSelected ? 'Selected' : 'Select'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {paper.status}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {paper.publication_year || 2024} • {paper.page_count} Pages
                      </span>
                    </div>
                  </div>

                  {/* Paper Title */}
                  <h3
                    onClick={() => onOpenViewer(paper.id, 1)}
                    className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 mb-1.5 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {paper.title}
                  </h3>

                  {/* Authors */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                    {paper.authors}
                  </p>

                  {/* Abstract Preview */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {paper.abstract || 'No abstract preview available.'}
                  </p>

                  {/* Interactive Topic Filter Chips */}
                  {paper.topics && paper.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {paper.topics.slice(0, 3).map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => setTopicFilter(topic)}
                          title={`Filter by ${topic}`}
                          className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 transition-colors"
                        >
                          #{topic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Tray */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenViewer(paper.id, 1)}
                      title="Read PDF"
                      className="px-2 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/60 text-slate-700 dark:text-slate-300 hover:text-brand-600 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                      <span>Read</span>
                    </button>

                    <button
                      onClick={() => onOpenSummary(paper)}
                      title="Structured Summary"
                      className="px-2 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 hover:text-amber-600 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Summary</span>
                    </button>

                    <button
                      onClick={() => onStartChatWithPaper(paper.id, `Summarize the core methodology and findings of "${paper.title}"`)}
                      title="Ask Questions"
                      className="px-2 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-300 hover:text-sky-600 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={() => onSelectForCompare([paper.id])}
                      title="Compare"
                      className="px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Scale className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Compare</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(paper.id, paper.title)}
                    title="Delete Paper"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
