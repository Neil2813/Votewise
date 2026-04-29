import { useMemo, useState } from 'react';
import { Send, Sparkles, RotateCcw } from 'lucide-react';
import { chat, isApiError, toApiAssetUrl } from '../lib/api';
import type { ChatMessage, LanguageCode } from '../lib/types';

const starterPrompts = [
  'Who can vote in India?',
  'What is Form 6?',
  'What are the rules for campaigning before polling?',
  'How do I verify a rumor about EVMs?',
];

export function ChatPage() {
  const [question, setQuestion] = useState('');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [voice, setVoice] = useState(false);
  const [audio, setAudio] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Ask an election question. I will keep the answer clear, neutral, and easy to understand.',
    },
  ]);
  const [error, setError] = useState('');

  const visibleMessages = useMemo(
    () => messages.filter((m) => m.role !== 'system'),
    [messages]
  );

  async function onSend(text?: string) {
    const prompt = (text ?? question).trim();
    if (!prompt || loading) return;

    const nextMessages = [...messages, { role: 'user', content: prompt } as ChatMessage];
    setMessages(nextMessages);
    setQuestion('');
    setLoading(true);
    setError('');

    try {
      const response = await chat(
        prompt,
        nextMessages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        lang,
        voice
      );

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: response.data.text },
      ]);
      setAudio(toApiAssetUrl(response.data.audio));
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Something went wrong.';
      setError(message);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'I could not generate a response right now, but I can still help with a simple explanation.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setMessages([
      {
        role: 'assistant',
        content:
          'Ask an election question. I will keep the answer clear and easy to understand.',
      },
    ]);
    setError('');
    setAudio('');
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-2xl font-black text-slate-950">Election Coach</h1>
            <button
              onClick={resetChat}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-[1.5rem] bg-[#211B5F] px-4 py-3 text-white'
                    : 'max-w-[85%] rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800'
                }
              >
                <p className="text-sm leading-6 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            ))}

            {loading && (
              <div className="max-w-[85%] rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Thinking...
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 md:p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterPrompts.map((item) => (
                <button
                  key={item}
                  onClick={() => onSend(item)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                  {item}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your question..."
                className="min-h-[120px] flex-1 resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-[#211B5F]"
              />

              <div className="flex gap-2 md:flex-col">
                <button
                  onClick={() => onSend()}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>

              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
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
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
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
              {audio ? <audio controls src={audio} className="h-9" /> : null}
            </div>

            {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
