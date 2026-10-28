import React from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Scale,
  Sparkles,
  Search,
  Network,
  GitFork,
  Calendar,
  Activity,
  Settings as SettingsIcon,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'papers', label: 'Paper Library', icon: FileText, path: '/papers' },
  { id: 'chat', label: 'Research Chat', icon: MessageSquare, path: '/chat' },
  { id: 'compare', label: 'Compare Papers', icon: Scale, path: '/compare' },
  { id: 'gaps', label: 'Research Gaps', icon: Sparkles, path: '/gaps' },
  { id: 'search', label: 'Semantic Search', icon: Search, path: '/search' },
  { id: 'citations', label: 'Citation Map', icon: GitFork, path: '/citations' },
  { id: 'graph', label: 'Knowledge Graph', icon: Network, path: '/graph' },
  { id: 'timeline', label: 'Research Timeline', icon: Calendar, path: '/timeline' },
  { id: 'evaluation', label: 'Evaluation & Benchmark', icon: Activity, path: '/evaluation' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

export const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-200 z-20">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
              ResearchAI
            </h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-600 dark:text-brand-400">
              Paper Companion
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-500 opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Demo Mode Badge */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Grounded Citation Mode</span>
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 mt-1">
            Zero hallucinated sources. Every assertion mapped to verified PDF pages.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>v1.0.0 (Production)</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
    </aside>
  );
};
