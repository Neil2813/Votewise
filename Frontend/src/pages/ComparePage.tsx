import { useState } from 'react';
import { ArrowRightLeft, RotateCcw } from 'lucide-react';
import { compare, isApiError, toApiAssetUrl } from '../lib/api';
import type { LanguageCode } from '../lib/types';

export function ComparePage() {
  const [left, setLeft] = useState('Eligibility rules');
  const [right, setRight] = useState('Nomination rules');
  const [context, setContext] = useState('India-only election education');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [voice, setVoice] = useState(false);
  const [summary, setSummary] = useState('');
  const [audio, setAudio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onCompare() {
    if (!left.trim() || !right.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await compare(left.trim(), right.trim(), context.trim() || undefined, lang, voice);
      setSummary(response.data.text);
      setAudio(toApiAssetUrl(response.data.audio));
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to compare.');
    } finally {
      setLoading(false);
    }
  }

  function onSwap() {
    setLeft(right);
    setRight(left);
  }

  function onReset() {
    setLeft('Eligibility rules');
    setRight('Nomination rules');
    setContext('India-only election education');
    setSummary('');
    setAudio('');
    setError('');
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-black text-slate-950">Compare</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={onSwap}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    Swap
                  </button>
                  <button
                    onClick={onReset}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Left item
                  </label>
                  <input
                    value={left}
                    onChange={(e) => setLeft(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-[#211B5F]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Right item
                  </label>
                  <input
                    value={right}
                    onChange={(e) => setRight(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-[#211B5F]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Context
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="min-h-[130px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-[#211B5F]"
                />
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
                  onClick={onCompare}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  {loading ? 'Comparing...' : 'Compare'}
                </button>

                <button
                  onClick={onSwap}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Swap sides
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
                <h2 className="text-xl font-bold text-slate-950">Comparison summary</h2>
                <p className="mt-1 text-sm text-slate-600">
                  The result appears here in a readable format.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Live output
              </div>
            </div>

            <div className="mt-5 min-h-[480px] rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              {audio ? <audio controls src={audio} className="mb-4 h-9 w-full" /> : null}
              {summary ? (
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                  {summary}
                </div>
              ) : (
                <div className="flex min-h-[430px] items-center justify-center text-center text-sm text-slate-500">
                  Your comparison summary will appear here after you click compare.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
