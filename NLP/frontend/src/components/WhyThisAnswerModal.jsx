import React from 'react';
import { X, HelpCircle, CheckCircle2, Layers, Cpu, FileSearch } from 'lucide-react';

export const WhyThisAnswerModal = ({ isOpen, onClose, data, query }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Explainability & Evidence Grounding
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent breakdown of retrieved literature and reasoning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Query & Strategy Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Query Intent
              </span>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {data.query_intent || 'Academic Synthesis'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Retrieval Strategy
              </span>
              <span className="font-semibold text-xs text-brand-600 dark:text-brand-400">
                {data.retrieval_strategy || 'Hybrid (Dense + BM25 RRF)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Evidence Chunks
              </span>
              <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                {data.retrieved_chunks_count || data.ranked_evidence?.length || 0} Passages Evaluated
              </span>
            </div>
          </div>

          {/* Reasoning Steps */}
          {data.reasoning_steps && data.reasoning_steps.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-brand-500" />
                Pipeline Verification Steps
              </h4>
              <div className="space-y-2">
                {data.reasoning_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ranked Evidence Passages */}
          {data.ranked_evidence && data.ranked_evidence.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-brand-500" />
                Ranked Supporting Evidence
              </h4>
              <div className="space-y-3">
                {data.ranked_evidence.map((ev, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {ev.paper_title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono text-[10px]">
                        Relevance: {Math.round((ev.score || 0) * 100)}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mb-2">
                      Page {ev.page_number} • Section: <strong className="text-slate-600 dark:text-slate-300 font-medium">{ev.section_name}</strong>
                    </div>
                    <p className="font-serif italic text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                      "{ev.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
