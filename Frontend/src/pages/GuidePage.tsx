import { useState } from 'react';
import { WandSparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { generateGuide, isApiError } from '../lib/api';
import type { SourceHit } from '../lib/types';
import { SourceList } from '../components/SourceList';
import { StatusPill } from '../components/StatusPill';

const topicPresets = [
  'India election process',
  'Voter registration',
  'Nomination rules',
  'Poll-day rules',
  'Voting methods',
  'Expenditure rules',
  'Accessibility',
];

export function GuidePage() {
  const [topic, setTopic] = useState('India election process');
  const [audience, setAudience] = useState('general voter');
  const [guide, setGuide] = useState('');
  const [sources, setSources] = useState<SourceHit[]>([]);
  const [mode, setMode] = useState('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onGenerate() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await generateGuide(topic.trim(), audience.trim());
      setGuide(response.guide);
      setSources(response.sources);
      setMode(response.mode);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to generate guide.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-[#211B5F]" />
          <div>
            <h1 className="text-3xl font-black text-slate-950">Guide Generator</h1>
            <p className="text-sm text-slate-600">Route: <code className="rounded bg-slate-100 px-1.5 py-0.5">POST /generate-guide</code></p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#211B5F]"
              placeholder="e.g. Voter registration"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Audience</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#211B5F]"
              placeholder="e.g. first-time voter"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Quick topics</p>
            <div className="flex flex-wrap gap-2">
              {topicPresets.map((item) => (
                <button
                  key={item}
                  onClick={() => setTopic(item)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <WandSparkles className="h-4 w-4" />
            Generate guide
          </button>

          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <StatusPill label={mode} tone="neutral" />
            <StatusPill label="India-only" tone="info" />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            The backend must produce a concise guide containing eligibility, registration, nomination, poll-day process,
            and do&apos;s and don&apos;ts.
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Guide output</h2>
          <div className="mt-4 min-h-[360px] rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            {guide ? (
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{guide}</div>
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-slate-500">
                Generated guide will appear here.
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
