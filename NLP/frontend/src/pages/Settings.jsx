import React from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Layers,
  Database,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';

export const Settings = () => {
  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>System Settings & Architecture Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Inspect operational parameters, RAG pipeline thresholds, and embedding engine configurations
        </p>
      </div>

      {/* Operational Mode Badge */}
      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-4">
        <div className="p-2 rounded-xl bg-emerald-500 text-white mt-0.5">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
            Active Mode: Grounded Neural Synthesis (Demo & Academic Mode)
          </h3>
          <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
            Operating in self-contained offline demo mode with zero external API dependencies.
            Embeddings are computed via deterministic subword semantic projections (or SentenceTransformers if cached)
            and answers are strictly synthesized from retrieved PDF passages with verified page provenance.
          </p>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* RAG Parameters */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-brand-500" />
            <span>RAG Hyperparameters</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Chunk Size Target:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">600 characters</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Chunk Overlap:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">100 characters</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Default Top-K Candidates:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">5 chunks</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Min Similarity Threshold:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">0.20 Cosine</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Hybrid Search (RRF):</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Enabled (Dense + BM25)</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Contextual Reranking:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Enabled</span>
            </div>
          </div>
        </div>

        {/* Database & Storage */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm">
            <Database className="w-4 h-4 text-sky-500" />
            <span>Storage & Embeddings</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Relational Database:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">SQLite (SQLAlchemy ORM)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Vector Engine:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">FAISS IndexFlatIP (Cosine)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Dense Embedding Dim:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">384 Dimensions</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Lexical Engine:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">BM25Okapi In-Memory</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">PDF Extraction:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">PyMuPDF (fitz)</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Max Upload Size:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">50 MB per PDF</span>
            </div>
          </div>
        </div>
      </div>

      {/* External LLM Configuration Guide */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-500" />
          <span>Switching to External Live LLM (OpenAI / Groq / Ollama / vLLM)</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          To connect live external language models, set your API key in <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">backend/.env</code>:
        </p>
        <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`DEMO_MODE=false
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1   # Or http://localhost:11434/v1 for Ollama
LLM_MODEL=gpt-4o-mini`}
        </pre>
        <p className="text-[11px] text-slate-400">
          The system will automatically switch from Grounded Demo Synthesis to live API calls while maintaining strict citation grounding and refusal protocols.
        </p>
      </div>
    </div>
  );
};
