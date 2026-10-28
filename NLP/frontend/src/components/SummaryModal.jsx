import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Download,
  Check,
  Copy,
  AlertTriangle,
  Layers,
  Target,
  Cpu,
  Database,
  BarChart3,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';

export const SummaryModal = ({ isOpen, onClose, paper, onOpenViewer, onStartChat }) => {
  const [activeTab, setActiveTab] = useState('structured'); // 'structured' or 'beginner'
  const [copied, setCopied] = useState(false);

  if (!isOpen || !paper) return null;

  const struct = paper.structured_summary || {};
  const beginner = paper.beginner_summary || 'Beginner analogy is generating...';

  const copyToClipboard = () => {
    const textToCopy =
      activeTab === 'structured'
        ? JSON.stringify(struct, null, 2)
        : beginner;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = async () => {
    try {
      const resText = await api.exportAsset({
        export_type: 'summary',
        target_id: paper.id,
        format: 'markdown',
      });
      const blob = new Blob([resText], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `summary_${paper.id}.md`;
      a.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {paper.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {paper.authors} • {paper.publication_year || 2024}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Read Button */}
            {onOpenViewer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenViewer(paper.id, 1);
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Read in Document Viewer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Read PDF</span>
              </button>
            )}

            {/* Direct Chat Button */}
            {onStartChat && (
              <button
                onClick={() => {
                  onClose();
                  onStartChat(paper.id, `Explain the methodology and results of "${paper.title}"`);
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Ask Questions in Chat"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                <span className="hidden sm:inline">Chat</span>
              </button>
            )}

            <button
              onClick={handleDownloadMarkdown}
              title="Download Markdown Report"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-brand-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/20">
          <button
            onClick={() => setActiveTab('structured')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'structured'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Structured Summary (11 Academic Dimensions)</span>
          </button>

          <button
            onClick={() => setActiveTab('beginner')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'beginner'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Explain Like I'm a Beginner (ELI5)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'structured' ? (
            <div className="space-y-6">
              {/* 1. One-Line Summary Card */}
              {struct.one_line_summary && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-teal-50 dark:from-brand-950/40 dark:to-teal-950/40 border border-brand-200/80 dark:border-brand-800/60 shadow-xs">
                  <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider block mb-1">
                    1. One-Line Core Takeaway
                  </span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {struct.one_line_summary}
                  </p>
                </div>
              )}

              {/* 2. Abstract Summary */}
              {struct.abstract_summary && (
                <div>
                  <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    2. Abstract Summary
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                    {struct.abstract_summary}
                  </p>
                </div>
              )}

              {/* 3 & 4. Problem & Objectives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-brand-500" />
                    3. Research Problem
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {struct.research_problem || 'Core accuracy and scalability trade-offs in scientific document modeling.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-500" />
                    4. Objectives
                  </span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {struct.objectives?.map((obj, i) => <li key={i}>{obj}</li>) || <li>Validate proposed architecture across scientific benchmarks.</li>}
                  </ul>
                </div>
              </div>

              {/* 5, 6, 7. Methodology, Dataset, Model */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-brand-500" />
                    5. Methodology
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {struct.methodology || paper.methodology_overview || 'Novel attention and loss formulation.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Database className="w-3 h-3 text-brand-500" />
                    6. Datasets
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {struct.dataset || 'SciDocs and domain-specific academic corpora.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-brand-500" />
                    7. Model / Architecture
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {struct.model_or_algorithm || 'Transformer-based neural representation.'}
                  </p>
                </div>
              </div>

              {/* 8, 9, 10. Results, Limitations, Future Work */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40">
                  <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    8. Key Empirical Results
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {struct.results || paper.key_findings || 'Outperforms conventional baseline models in accuracy and throughput.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40">
                  <span className="font-bold text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    9. Stated Limitations
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {struct.limitations || paper.limitations || 'Monolingual evaluation, memory scaling constants, and edge-case errors.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    10. Future Work
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {struct.future_work || 'Cross-disciplinary testing and multi-modal figure integration.'}
                  </p>
                </div>
              </div>

              {/* 11. Key Contributions */}
              {struct.key_contributions && (
                <div>
                  <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    11. Key Scientific Contributions
                  </h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {struct.key_contributions.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Beginner / ELI5 View */
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-teal-50/60 to-white dark:from-slate-900 dark:via-brand-950/40 dark:to-slate-900 border border-brand-200 dark:border-brand-800/60 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-base">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Explain Like I'm a Beginner (ELI5)</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans font-medium">
                {beginner}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
