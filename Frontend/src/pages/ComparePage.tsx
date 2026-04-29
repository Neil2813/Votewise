import { useState } from 'react';
import { Scale, ArrowRightLeft } from 'lucide-react';
import { compare, isApiError } from '../lib/api';
import type { SourceHit } from '../lib/types';
import { SourceList } from '../components/SourceList';
import { StatusPill } from '../components/StatusPill';

export function ComparePage() {
  const [left, setLeft] = useState('Eligibility rules');
  const [right, setRight] = useState('Nomination rules');
  const [context, setContext] = useState('India-only election education');
  const [summary, setSummary] = useState('');
  const [sources, setSources] = useState<SourceHit[]>([]);
  const [mode, setMode] = useState('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onCompare() {
    if (!left.trim() || !right.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await compare(left.trim(), right.trim(), context.trim() || undefined);
      setSummary(response.summary);
      setSources(response.sources);
      setMode(response.mode);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to compare.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Scale className="h-6 w-6 text-[#211B5F]" />
          <div>
            <h1 className="text-3xl font-black text-slate-950">Neutral Comparison</h1>
            <p className="text-sm text-slate-600">Route: <code className="rounded bg-slate-100 px-1.5 py-0.5">POST /compare</code></p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Left item</label>
            <input
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#211B5F]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Right item</label>
            <input
              value={right}
              onChange={(e) => setRight(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#211B5F]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Context</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#211B5F]"
            />
          </div>
          <button
            onClick={onCompare}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Compare
          </button>
          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
          <StatusPill label={mode} tone="neutral" />
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Comparison summary</h2>
          <div className="mt-4 min-h-[320px] rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            {summary ? (
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{summary}</div>
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-slate-500">
                Summary will appear here.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">Source snippets</h3>
          <div className="mt-4">
            <SourceList sources={sources} />
          </div>
        </div>
      </section>
    </div>
  );
}
