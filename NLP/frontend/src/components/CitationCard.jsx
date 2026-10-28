import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-react';

export const CitationCard = ({ citation, onJumpToPage }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-3 hover:border-brand-500/40 transition-all text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-[11px]">
            {citation.citation_index}
          </span>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
              {citation.paper_title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Page {citation.page_number}</span>
              <span>•</span>
              <span className="font-medium text-brand-600 dark:text-brand-400">{citation.section_name}</span>
              {citation.publication_year && (
                <>
                  <span>•</span>
                  <span>{citation.publication_year}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onJumpToPage && (
            <button
              onClick={() => onJumpToPage(citation.paper_id, citation.page_number)}
              title="Open PDF Page"
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/80 dark:hover:text-brand-300 text-slate-600 dark:text-slate-300 font-medium transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              <span>Page {citation.page_number}</span>
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded">
          <p className="font-serif italic leading-relaxed text-[11.5px]">
            "{citation.snippet}"
          </p>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Confidence Match: {Math.round((citation.confidence_score || 0.85) * 100)}%</span>
            <span>Chunk ID: #{citation.chunk_id || 'N/A'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
