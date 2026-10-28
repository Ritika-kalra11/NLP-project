import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Download,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Layers,
  Database,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';

export const ResearchGaps = ({ onOpenViewer, onStartChat, showToast }) => {
  const [gapsData, setGapsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [gapSearch, setGapSearch] = useState('');

  useEffect(() => {
    fetchGaps();
  }, []);

  const fetchGaps = async () => {
    setLoading(true);
    try {
      const data = await api.getResearchGaps();
      setGapsData(data);
    } catch (err) {
      console.error('Failed to load research gaps:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const mdContent = await api.exportAsset({
        export_type: 'research_gaps',
        format: 'markdown',
      });
      const blob = new Blob([mdContent], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research_gaps_report_${Date.now()}.md`;
      a.click();
      if (showToast) showToast('Research gaps report downloaded as Markdown!', 'success');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const allCategories = ['All', ...new Set((gapsData?.gaps || []).map((g) => g.category))];

  const filteredGaps = (gapsData?.gaps || []).filter((gap) => {
    const matchesCategory = selectedCategory === 'All' || gap.category === selectedCategory;
    const matchesSearch =
      !gapSearch ||
      gap.title.toLowerCase().includes(gapSearch.toLowerCase()) ||
      gap.description.toLowerCase().includes(gapSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Research Gap Discovery & Literature Opportunities</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-literature gap synthesis grounded in reported constraints and unaddressed benchmarks
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 text-white text-xs font-bold shadow-md hover:from-brand-700 hover:to-teal-700 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Gap Report (MD)</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs">Analyzing common themes & evidence coverage across papers...</p>
        </div>
      ) : gapsData ? (
        <div className="space-y-8">
          {/* Overarching Themes & Methodologies Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                Common Themes
              </span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                {gapsData.common_themes.slice(0, 3).map((theme, i) => (
                  <li key={i} className="line-clamp-1">{theme}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                Frequently Used Methods
              </span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                {gapsData.common_methodologies.slice(0, 3).map((m, i) => (
                  <li key={i} className="line-clamp-1">{m}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                Common Datasets
              </span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                {gapsData.common_datasets.slice(0, 3).map((d, i) => (
                  <li key={i} className="line-clamp-1">{d}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Common Limitations
              </span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                {gapsData.common_limitations.slice(0, 3).map((l, i) => (
                  <li key={i} className="line-clamp-1">{l}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Filters: Categories & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gapSearch}
                onChange={(e) => setGapSearch(e.target.value)}
                placeholder="Search gap keywords..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Discovered Gaps List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Identified Literature Gaps ({filteredGaps.length})
              </h3>
            </div>

            {filteredGaps.map((gap) => (
              <div
                key={gap.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                {/* Gap Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
                      {gap.category}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1.5">
                      {gap.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        gap.confidence_coverage === 'High'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : gap.confidence_coverage === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Evidence Coverage: {gap.confidence_coverage}</span>
                    </span>

                    <button
                      onClick={() =>
                        onStartChat(
                          null,
                          `Explain the research gap "${gap.title}" and analyze why current papers fail to resolve it.`
                        )
                      }
                      className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/80 hover:bg-brand-100 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Investigate this gap in chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                      <span>Explore in Chat</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {gap.description}
                </p>

                {/* Supporting Document Evidence Provenance */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Grounded Document Evidence ({gap.evidence.length} Papers)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {gap.evidence.map((ev, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            <span className="truncate pr-2">{ev.paper_title}</span>
                            <span className="text-brand-600 dark:text-brand-400 flex-shrink-0 font-mono">
                              Page {ev.page_number}
                            </span>
                          </div>
                          <p className="font-serif italic text-[11.5px] text-slate-600 dark:text-slate-400 line-clamp-3">
                            "{ev.snippet}"
                          </p>
                        </div>

                        <button
                          onClick={() => onOpenViewer(ev.paper_id, ev.page_number, ev.snippet)}
                          className="mt-2.5 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-start font-sans"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Jump to Page {ev.page_number} in PDF</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Future Direction */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-teal-50 dark:from-amber-950/20 dark:to-teal-950/20 border border-amber-200/70 dark:border-amber-800/40 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white mt-0.5 flex-shrink-0 shadow-sm">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      Recommended Research Direction:
                    </h5>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                      {gap.recommended_future_direction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400 text-xs">
          Upload papers to synthesize literature gaps.
        </div>
      )}
    </div>
  );
};
