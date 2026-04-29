import { useState } from 'react';
import { RotateCcw, WandSparkles } from 'lucide-react';
import { generateGuide, isApiError, toApiAssetUrl } from '../lib/api';
import type { LanguageCode } from '../lib/types';

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
  const [lang, setLang] = useState<LanguageCode>('en');
  const [voice, setVoice] = useState(false);
  const [guide, setGuide] = useState('');
  const [audio, setAudio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onGenerate() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await generateGuide(topic.trim(), audience.trim(), lang, voice);
      setGuide(response.data.text);
      setAudio(toApiAssetUrl(response.data.audio));
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to generate guide.');
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setTopic('India election process');
    setAudience('general voter');
    setGuide('');
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
                <h1 className="text-2xl font-black text-slate-950">Guide Generator</h1>
                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Topic
                  </label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-[#211B5F]"
                    placeholder="e.g. Voter registration"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Audience
                  </label>
                  <input
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-[#211B5F]"
                    placeholder="e.g. first-time voter"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
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
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-950">Quick topics</h3>
              <p className="mt-1 text-sm text-slate-600">
                Tap one to fill the topic field instantly.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {topicPresets.map((item) => (
                  <button
                    key={item}
                    onClick={() => setTopic(item)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={onGenerate}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <WandSparkles className="h-4 w-4" />
              {loading ? 'Generating...' : 'Generate guide'}
            </button>

            {error ? (
              <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700 shadow-sm">
                {error}
              </section>
            ) : null}
          </div>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Guide preview</h2>
                <p className="mt-1 text-sm text-slate-600">
                  The generated guide appears here in a clean reading view.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Live output
              </div>
            </div>

            <div className="mt-5 min-h-[460px] rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              {audio ? <audio controls src={audio} className="mb-4 h-9 w-full" /> : null}
              {guide ? (
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                  {guide}
                </div>
              ) : (
                <div className="flex min-h-[410px] items-center justify-center text-center text-sm text-slate-500">
                  Your guide will appear here after generation.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
