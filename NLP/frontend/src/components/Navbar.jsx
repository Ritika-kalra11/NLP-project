import React from 'react';
import { Sun, Moon, UploadCloud, Search, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Navbar = ({ activeTab, onOpenUpload, onSearchClick }) => {
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Research Dashboard';
      case 'papers': return 'Paper Library';
      case 'chat': return 'Research Chat & QA';
      case 'compare': return 'Multi-Paper Comparison';
      case 'gaps': return 'Research Gap Discovery';
      case 'search': return 'Semantic & Hybrid Search';
      case 'citations': return 'Citation Map (Earlier & Future Work)';
      case 'graph': return 'Knowledge Graph Exploration';
      case 'timeline': return 'Chronological Research Timeline';
      case 'evaluation': return 'RAG Evaluation & Quality Metrics';
      case 'settings': return 'System Settings';
      default: return 'ResearchAI';
    }
  };

  return (
    <header className="h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          {getPageTitle(activeTab)}
        </h2>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          NLP + RAG
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut */}
        <button
          onClick={onSearchClick}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search literature...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">
            Ctrl+K
          </kbd>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Papers</span>
        </button>

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
