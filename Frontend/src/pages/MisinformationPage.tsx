import { useState } from 'react';
import { BadgeAlert, Search, ShieldCheck, ShieldQuestion, ShieldX } from 'lucide-react';
import { misinformationCheck, isApiError } from '../lib/api';
import type { SourceHit } from '../lib/types';
import { SourceList } from '../components/SourceList';
import { StatusPill } from '../components/StatusPill';

const claimSamples = [
  'A person not in the voter list can vote using ID proof.',
  'EVMs can be hacked because they are online.',
  'Voting is compulsory in India and people are fined for not voting.',
  'Postal ballots are unreliable.',
];

export function MisinformationPage() {
  const [claim, setClaim] = useState('');
  const [verdict, setVerdict] = useState<'True' | 'False' | 'Unverified' | ''>('');
  const [explanation, setExplanation] = useState('');
  const [matchedRule, setMatchedRule] = useState('');
  const [sources, setSources] = useState<SourceHit[]>([]);
  const [mode, setMode] = useState('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tone =
    verdict === 'True' ? 'good' : verdict === 'False' ? 'danger' : verdict === 'Unverified' ? 'warn' : 'neutral';

  async function onCheck(text?: string) {
    const input = (text ?? claim).trim();
    if (!input || loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await misinformationCheck(input);
      setVerdict(response.verdict);
      setExplanation(response.explanation);
      setMatchedRule(response.matched_rule || '');
      setSources(response.sources);
      setMode(response.mode);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to verify the claim.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <BadgeAlert className="h-6 w-6 text-[#211B5F]" />
          <div>
            <h1 className="text-3xl font-black text-slate-950">Misinformation Check</h1>
            <p className="text-sm text-slate-600">Route: <code className="rounded bg-slate-100 px-1.5 py-0.5">POST /misinformation-check</code></p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Claim</label>
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              className="min-h-[160px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#211B5F]"
              placeholder="Paste a rumor, myth, or election claim here..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {claimSamples.map((item) => (
              <button
                key={item}
                onClick={() => onCheck(item)}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            onClick={() => onCheck()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Search className="h-4 w-4" />
            Analyze claim
          </button>

          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <StatusPill label={verdict || 'waiting'} tone={tone} />
            <StatusPill label={mode} tone="neutral" />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Verdict</h2>
          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              {verdict === 'True' ? (
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              ) : verdict === 'False' ? (
                <ShieldX className="h-6 w-6 text-rose-600" />
              ) : (
                <ShieldQuestion className="h-6 w-6 text-amber-600" />
              )}
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
                {verdict || 'No verdict yet'}
              </p>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">
              {explanation || 'The result will appear here after analysis.'}
            </p>
            {matchedRule ? (
              <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-700">
                <span className="font-semibold">Matched rule:</span> {matchedRule}
              </p>
            ) : null}
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
