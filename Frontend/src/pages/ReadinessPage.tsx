import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { readinessScore, toApiAssetUrl } from '../lib/api';
import { clamp, prettyLabel } from '../lib/utils';
import { StatusPill } from '../components/StatusPill';
import type { LanguageCode } from '../lib/types';

type ReadinessFields = {
  registration_done: boolean;
  documents_ready: boolean;
  guide_completed: boolean;
  simulation_done: boolean;
  polling_location_verified: boolean;
  understand_rights: boolean;
};

const initialState: ReadinessFields = {
  registration_done: false,
  documents_ready: false,
  guide_completed: false,
  simulation_done: false,
  polling_location_verified: false,
  understand_rights: false,
};

export function ReadinessPage() {
  const [state, setState] = useState<ReadinessFields>(initialState);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [voice, setVoice] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [label, setLabel] = useState('');
  const [resultText, setResultText] = useState('');
  const [breakdown, setBreakdown] = useState<Record<string, boolean>>({});
  const [audio, setAudio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const completion = useMemo(() => {
    const total = Object.keys(state).length;
    const yes = Object.values(state).filter(Boolean).length;
    return clamp(Math.round((yes / total) * 100), 0, 100);
  }, [state]);

  async function onCompute() {
    setLoading(true);
    setError('');
    try {
      const response = await readinessScore({ ...state, lang, voice });
      setScore(completion);
      setLabel(readinessLabel(completion));
      setBreakdown(state);
      setResultText(response.data.text);
      setAudio(toApiAssetUrl(response.data.audio));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute readiness.');
    } finally {
      setLoading(false);
    }
  }

  function toggle(key: keyof ReadinessFields) {
    setState((current) => ({ ...current, [key]: !current[key] }));
  }

  function onReset() {
    setState(initialState);
    setScore(null);
    setLabel('');
    setResultText('');
    setBreakdown({});
    setAudio('');
    setError('');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-slate-950">Readiness Score</h1>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {(Object.keys(state) as Array<keyof ReadinessFields>).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
            >
              <span className="text-sm font-semibold text-slate-800">{prettyLabel(key)}</span>
              <input
                type="checkbox"
                checked={state[key]}
                onChange={() => toggle(key)}
                className="h-5 w-5 accent-[#211B5F]"
              />
            </label>
          ))}
        </div>

        <button
          onClick={onCompute}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" />
          Compute readiness
        </button>

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

        {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
      </section>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Result</h2>
          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-500">Local completion</p>
            <p className="mt-2 text-6xl font-black text-[#211B5F]">{completion}%</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{label || 'Not computed yet'}</p>
            <div className="mt-4">
              <StatusPill label={score == null ? 'waiting' : `${score}%`} tone={score && score >= 80 ? 'good' : score && score >= 50 ? 'warn' : 'neutral'} />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">Breakdown</h3>
          <div className="mt-4 space-y-2">
            {Object.keys(state).map((key) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <span>{prettyLabel(key)}</span>
                <span className={breakdown[key] ? 'font-semibold text-emerald-700' : 'font-semibold text-slate-400'}>
                  {breakdown[key] ? 'Done' : 'Missing'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            {audio ? <audio controls src={audio} className="mb-4 h-9 w-full" /> : null}
            <p className="whitespace-pre-wrap leading-7">
              {resultText || 'Your formatted readiness result will appear here.'}
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}

function readinessLabel(score: number): string {
  if (score >= 90) return 'Fully Ready';
  if (score >= 70) return 'Mostly Ready';
  if (score >= 50) return 'Partially Ready';
  return 'Not Ready';
}
