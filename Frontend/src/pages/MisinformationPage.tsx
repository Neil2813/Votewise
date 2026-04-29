import { useState } from 'react';
import { Search, ShieldCheck, ShieldQuestion, ShieldX, RotateCcw } from 'lucide-react';
import { misinformationCheck, isApiError, toApiAssetUrl } from '../lib/api';
import type { LanguageCode } from '../lib/types';

const claimSamples = [
  'A person not in the voter list can vote using ID proof.',
  'EVMs can be hacked because they are online.',
  'Voting is compulsory in India and people are fined for not voting.',
  'Postal ballots are unreliable.',
];

export function MisinformationPage() {
  const [claim, setClaim] = useState('');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [voice, setVoice] = useState(false);
  const [verdict, setVerdict] = useState<'True' | 'False' | 'Unverified' | ''>('');
  const [explanation, setExplanation] = useState('');
  const [matchedRule, setMatchedRule] = useState('');
  const [audio, setAudio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onCheck(text?: string) {
    const input = (text ?? claim).trim();
    if (!input || loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await misinformationCheck(input, lang, voice);
      const text = response.data.text;
      setVerdict(extractVerdict(text));
      setExplanation(text);
      setMatchedRule('');
      setAudio(toApiAssetUrl(response.data.audio));
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
    setAudio('');
    setError('');
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-black text-slate-950">Misinformation Check</h1>
                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

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

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  value={lang}
                  onChange={(e) => {
                    const nextLang = e.target.value as LanguageCode;
                    setLang(nextLang);
                    if (nextLang !== 'en') {
                      setVoice(false);
                      setAudio('');
                    }
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                </select>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={voice}
                    disabled={lang !== 'en'}
                    onChange={(e) => setVoice(e.target.checked)}
                    className="h-4 w-4 accent-[#211B5F] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  Voice
                </label>
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
              </div>

              {error ? (
                <p className="mt-4 text-sm font-medium text-rose-700">{error}</p>
              ) : null}
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
              {audio ? <audio controls src={audio} className="mb-4 h-9 w-full" /> : null}
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

function extractVerdict(text: string): 'True' | 'False' | 'Unverified' {
  const lower = text.toLowerCase();
  if (lower.includes('verdict: true') || lower.includes('verdict - true')) return 'True';
  if (lower.includes('verdict: false') || lower.includes('verdict - false')) return 'False';
  return 'Unverified';
}
