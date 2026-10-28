import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckSquare,
  Square,
  Sparkles,
  BookOpen,
  AlertCircle,
  HelpCircle,
  GitCompare,
  CheckCircle2,
  FileQuestion,
  RefreshCw,
  Download,
  Copy,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';

export const ComparePapers = ({ onOpenViewer, initialPaperIds = [], showToast }) => {
  const [papers, setPapers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [consistencyData, setConsistencyData] = useState(null);
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' or 'consistency'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCell, setCopiedCell] = useState(null);

  useEffect(() => {
    loadPapers();
  }, []);

  useEffect(() => {
    if (initialPaperIds && initialPaperIds.length > 0) {
      setSelectedIds(initialPaperIds);
      if (initialPaperIds.length >= 2) {
        runComparisonWithIds(initialPaperIds);
      }
    }
  }, [initialPaperIds]);

  const loadPapers = async () => {
    try {
      const data = await api.getPapers();
      setPapers(data);
      if (data.length >= 2 && selectedIds.length === 0 && (!initialPaperIds || initialPaperIds.length === 0)) {
        const top2 = [data[0].id, data[1].id];
        setSelectedIds(top2);
      }
    } catch (err) {
      console.error('Failed to load papers for compare:', err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = papers.map((p) => p.id);
    setSelectedIds(allIds);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const runComparisonWithIds = async (ids) => {
    if (ids.length < 2) {
      setError('Please select at least 2 research papers to generate comparative synthesis.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const [compRes, consRes] = await Promise.all([
        api.compare({ paper_ids: ids }),
        api.checkConsistency({ paper_ids: ids }),
      ]);
      setComparisonData(compRes);
      setConsistencyData(consRes);
      if (showToast) showToast(`Comparison generated for ${ids.length} papers!`, 'success');
    } catch (err) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunComparison = () => {
    runComparisonWithIds(selectedIds);
  };

  const handleExportMarkdown = async () => {
    if (!comparisonData) return;
    try {
      const mdContent = await api.exportAsset({
        export_type: 'comparison',
        target_ids: selectedIds,
        format: 'markdown',
      });
      const blob = new Blob([mdContent], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paper_comparison_${Date.now()}.md`;
      a.click();
      if (showToast) showToast('Comparison matrix exported as Markdown!', 'success');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const copyCellEvidence = (snippet, key) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCell(key);
    setTimeout(() => setCopiedCell(null), 1500);
    if (showToast) showToast('Evidence passage copied!', 'info');
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-500" />
            <span>Multi-Paper Comparative Analysis & Auditing</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Feature matrix extraction and scientific consensus auditing grounded in document passages
          </p>
        </div>

        {comparisonData && (
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Export Comparison (MD)</span>
          </button>
        )}
      </div>

      {/* Paper Selection Tray */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Papers to Compare ({selectedIds.length} of {papers.length} selected)
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={selectAll}
                className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={clearSelection}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            </div>
          </div>

          <button
            onClick={handleRunComparison}
            disabled={selectedIds.length < 2 || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:from-brand-700 hover:to-indigo-700 disabled:opacity-40 transition-all active:scale-95"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
            <span>{loading ? 'Synthesizing...' : 'Generate Grounded Comparison'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {papers.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40'
                }`}
              >
                <div className="mt-0.5 text-brand-600 dark:text-brand-400">
                  {isSelected ? <CheckSquare className="w-4 h-4 text-brand-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {p.authors} ({p.publication_year || 2024})
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      {comparisonData && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Feature Comparison Matrix ({comparisonData.matrix.length} Dimensions)</span>
          </button>

          <button
            onClick={() => setActiveTab('consistency')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'consistency'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Scientific Consensus & Contradiction Auditor</span>
          </button>
        </div>
      )}

      {/* Tab 1: Feature Comparison Matrix Table */}
      {activeTab === 'matrix' && comparisonData && (
        <div className="space-y-6">
          {/* Overall Synthesis Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200/80 dark:border-brand-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs">
            <strong className="text-brand-800 dark:text-brand-300 font-bold block mb-1.5 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Cross-Document Executive Synthesis:
            </strong>
            {comparisonData.overall_synthesis}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300 w-44 uppercase tracking-wider text-[11px]">
                    Academic Feature
                  </th>
                  {comparisonData.paper_ids.map((id) => (
                    <th key={id} className="p-4 font-bold text-slate-800 dark:text-slate-200 min-w-[280px]">
                      {comparisonData.paper_titles[String(id)]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {comparisonData.matrix.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white bg-slate-50/40 dark:bg-slate-800/20 align-top">
                      {row.feature}
                    </td>
                    {comparisonData.paper_ids.map((id) => {
                      const cell = row.values[String(id)];
                      if (!cell) return <td key={id} className="p-4 text-slate-400">N/A</td>;
                      const cellKey = `${rIdx}-${id}`;
                      return (
                        <td key={id} className="p-4 align-top space-y-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                            {cell.summary}
                          </p>
                          <div className="relative group/snippet p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-[11.5px] text-slate-600 dark:text-slate-400 font-serif italic">
                            "{cell.evidence_snippet}"
                            <button
                              onClick={() => copyCellEvidence(cell.evidence_snippet, cellKey)}
                              className="opacity-0 group-hover/snippet:opacity-100 absolute top-2 right-2 p-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-slate-900 transition-opacity"
                              title="Copy Evidence"
                            >
                              {copiedCell === cellKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>Page {cell.page_number}</span>
                            <button
                              onClick={() => onOpenViewer(id, cell.page_number, cell.evidence_snippet)}
                              className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-bold font-sans"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>View in PDF</span>
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Consistency & Contradiction Analysis */}
      {activeTab === 'consistency' && consistencyData && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 leading-relaxed shadow-xs">
            <strong className="font-bold block mb-1 text-slate-900 dark:text-white text-sm">
              Scientific Consensus Summary:
            </strong>
            {consistencyData.summary_verdict}
          </div>

          <div className="space-y-4">
            {consistencyData.comparisons.map((claim, cIdx) => (
              <div
                key={cIdx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {claim.topic}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      claim.verdict === 'Complementary'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    Verdict: {claim.verdict}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supporting Claims */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px] block">
                      Common Ground & Consensus
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                      {claim.supporting_points.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Contrasting / Conditions */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                      Experimental Divergence & Conditions
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                      {claim.condition_differences.map((diff, i) => (
                        <li key={i}>{diff}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
