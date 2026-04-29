import { useState } from 'react';
import { BadgeAlert, Search, ShieldCheck, ShieldQuestion, ShieldX, RotateCcw } from 'lucide-react';
import { misinformationCheck, isApiError } from '../lib/api';
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
  const [mode, setMode] = useState('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tone =
    verdict === 'True'
      ? 'good'
      : verdict === 'False'
        ? 'danger'
        : verdict === 'Unverified'
          ? 'warn'
          : 'neutral';

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
      setMode(response.mode);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to verify the claim.');
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setClaim('');
    setVerdict('');
    setExplanation('');
    setMatchedRule('');
    setMode('local');
    setError('');
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#211B5F]/5 px-3 py-1 text-xs font-semibold text-[#211B5F]">
                <BadgeAlert className="h-4 w-4" />
                Claim verification
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Misinformation Check
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Paste a rumor, myth, or election claim and get a clear verdict in a
                simple, readable layout.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label={verdict || 'waiting'} tone={tone} />
              <StatusPill label={mode} tone="neutral" />
              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Check a claim</h2>
              <p className="mt-1 text-sm text-slate-600">
                Enter one claim at a time for a clearer result.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Claim
                </label>
                <textarea
                  value={claim}
                  onChange={(e) => setClaim(e.target.value)}
                  className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-[#211B5F]"
                  placeholder="Paste a rumor, myth, or election claim here..."
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {claimSamples.map((item) => (
                  <button
                    key={item}
                    onClick={() => onCheck(item)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => onCheck()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search className="h-4 w-4" />
                  {loading ? 'Checking...' : 'Analyze claim'}
                </button>

                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </button>
              </div>

              {error ? (
                <p className="mt-4 text-sm font-medium text-rose-700">{error}</p>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-950">Quick note</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This layout is intentionally simple: input on the left, result on the right,
                with no extra source block distracting the user.
              </p>
            </section>
          </div>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Verdict</h2>
                <p className="mt-1 text-sm text-slate-600">
                  The result appears here after analysis.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Live output
              </div>
            </div>

            <div className="mt-5 min-h-[480px] rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
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

              <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                  {explanation || 'The result will appear here after analysis.'}
                </p>
              </div>

              {matchedRule ? (
                <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">Matched rule</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{matchedRule}</p>
                </div>
              ) : null}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}