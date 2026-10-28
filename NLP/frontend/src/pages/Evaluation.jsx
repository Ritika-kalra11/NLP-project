import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  CheckCircle2,
  Clock,
  ShieldCheck,
  BarChart2,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';

export const Evaluation = () => {
  const [evalData, setEvalData] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadEvaluation();
  }, []);

  const loadEvaluation = async () => {
    try {
      const data = await api.getEvaluation();
      setEvalData(data);
    } catch (err) {
      console.error('Failed to load evaluation:', err);
    }
  };

  const handleRunBenchmark = async () => {
    setRunning(true);
    try {
      const data = await api.runEvaluation();
      setEvalData(data);
    } catch (err) {
      console.error('Benchmark failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const chartData = (evalData?.benchmark_results || []).map((r) => ({
    name: r.test_id,
    Precision: Math.round(r.retrieval_precision * 100),
    Recall: Math.round(r.retrieval_recall * 100),
    Faithfulness: Math.round(r.faithfulness_score * 100),
  }));

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>RAG Evaluation & Quality Benchmark</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Empirical telemetry: Precision@K, Recall@K, Answer Faithfulness, and Citation Coverage
          </p>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{running ? 'Running Test Suite...' : 'Run Benchmark Suite'}</span>
        </button>
      </div>

      {evalData && (
        <div className="space-y-8">
          {/* Top Macro Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Mean Retrieval Precision
              </span>
              <h3 className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {Math.round(evalData.mean_retrieval_precision * 100)}%
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Keyword & topic density</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Mean Retrieval Recall
              </span>
              <h3 className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                {Math.round(evalData.mean_retrieval_recall * 100)}%
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Target paper coverage</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Answer Faithfulness
              </span>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(evalData.mean_faithfulness_score * 100)}%
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Zero ungrounded claims</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Citation Coverage
              </span>
              <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(evalData.mean_citation_coverage * 100)}%
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Paragraph citation density</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Mean Latency
              </span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <Clock className="w-5 h-5 text-slate-400" />
                <span>{evalData.mean_latency_ms} ms</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Hybrid retrieval + synthesis</p>
            </div>
          </div>

          {/* Quality Visualizer Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                RAG Metric Distribution Across Benchmark Queries
              </h3>
              <p className="text-xs text-slate-400">Precision, Recall, and Faithfulness across test cases</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Precision" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Recall" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Faithfulness" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Test Cases Results Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Evaluated Test Dataset Cases
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                    <th className="p-3">ID</th>
                    <th className="p-3">Research Question</th>
                    <th className="p-3">Precision</th>
                    <th className="p-3">Recall</th>
                    <th className="p-3">Faithfulness</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Sources</th>
                    <th className="p-3">Grounding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {evalData.benchmark_results.map((res) => (
                    <tr key={res.test_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {res.test_id}
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs">
                        {res.question}
                      </td>
                      <td className="p-3 font-semibold text-brand-600 dark:text-brand-400">
                        {Math.round(res.retrieval_precision * 100)}%
                      </td>
                      <td className="p-3 font-semibold text-sky-600 dark:text-sky-400">
                        {Math.round(res.retrieval_recall * 100)}%
                      </td>
                      <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {Math.round(res.faithfulness_score * 100)}%
                      </td>
                      <td className="p-3 text-slate-400">
                        {res.latency_ms} ms
                      </td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                        {res.citations_count} citations
                      </td>
                      <td className="p-3">
                        {res.is_grounded ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Refusal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
