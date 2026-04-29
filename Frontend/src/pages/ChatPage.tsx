import { useMemo, useState } from 'react';
import { Send, Sparkles, RotateCcw } from 'lucide-react';
import { chat, isApiError } from '../lib/api';
import type { ChatMessage, SourceHit } from '../lib/types';
import { SourceList } from '../components/SourceList';
import { StatusPill } from '../components/StatusPill';

const starterPrompts = [
  'Who can vote in India?',
  'What is Form 6?',
  'What are the rules for campaigning before polling?',
  'How do I verify a rumor about EVMs?',
];

export function ChatPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Ask an India-only election question. I will answer using the backend’s retrieval-first policy and stay neutral and factual.',
    },
  ]);
  const [lastMode, setLastMode] = useState<string>('local');
  const [verified, setVerified] = useState<boolean>(false);
  const [sources, setSources] = useState<SourceHit[]>([]);
  const [error, setError] = useState<string>('');

  const visibleMessages = useMemo(() => messages.filter((m) => m.role !== 'system'), [messages]);

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
        nextMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
      );
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }]);
      setLastMode(response.mode);
      setVerified(response.verified);
      setSources(response.sources);
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Something went wrong.';
      setError(message);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'I could not generate a live answer right now, but I can still provide the verified rule or source-based summary.' },
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
          'Ask an India-only election question. I will answer using the backend’s retrieval-first policy and stay neutral and factual.',
      },
    ]);
    setSources([]);
    setVerified(false);
    setError('');
    setLastMode('local');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Election Coach</h1>
            <p className="mt-1 text-sm text-slate-600">Route: <code className="rounded bg-slate-100 px-1.5 py-0.5">POST /chat</code></p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill label={verified ? 'Verified from sources' : 'Answer generated'} tone={verified ? 'good' : 'info'} />
            <StatusPill label={lastMode} tone="neutral" />
            <button
              onClick={resetChat}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {visibleMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={message.role === 'user' ? 'ml-auto max-w-[85%] rounded-[1.5rem] bg-[#211B5F] p-4 text-white' : 'max-w-[85%] rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-slate-800'}
            >
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
            </div>
          ))}
          {loading ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Thinking with retrieved India-only knowledge...
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap gap-2">
            {starterPrompts.map((item) => (
              <button
                key={item}
                onClick={() => onSend(item)}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                {item}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about eligibility, nominations, voting methods, poll-day rules, or misinformation..."
              className="min-h-[110px] flex-1 rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none ring-0 focus:border-[#211B5F]"
            />
            <button
              onClick={() => onSend()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
          {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Response sources</h2>
          <p className="mt-1 text-sm text-slate-600">The backend returns source snippets when retrieval finds a match.</p>
          <div className="mt-4">
            <SourceList sources={sources} />
          </div>
        </section>
      </aside>
    </div>
  );
}
