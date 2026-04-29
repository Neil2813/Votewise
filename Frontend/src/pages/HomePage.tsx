import {
  ArrowRight,
  FileText,
  MessageSquareText,
  BadgeAlert,
  Gauge,
  MonitorPlay,
  SearchCheck,
  CircleGauge,
  Landmark,
} from 'lucide-react';
import type { HealthResponse } from '../lib/types';
import { StatusPill } from '../components/StatusPill';

const cards = [
  {
    key: 'chat',
    title: 'Chat Coach',
    desc: 'Ask election-related questions and get clear, neutral answers.',
    icon: MessageSquareText,
  },
  {
    key: 'guide',
    title: 'Guide Generator',
    desc: 'Create a simple, audience-friendly election process summary.',
    icon: FileText,
  },
  {
    key: 'compare',
    title: 'Neutral Compare',
    desc: 'Compare roles, rules, and processes without bias.',
    icon: Landmark,
  },
  {
    key: 'misinformation',
    title: 'Fact Check',
    desc: 'Check claims, myths, and rumors against trusted references.',
    icon: BadgeAlert,
  },
  {
    key: 'readiness',
    title: 'Readiness Score',
    desc: 'Review your voting preparedness with a quick local check.',
    icon: Gauge,
  },
  {
    key: 'simulate',
    title: 'Simulator',
    desc: 'Walk through the flow in a guided practice view.',
    icon: MonitorPlay,
  },
] as const;

export function HomePage({
  onNavigate,
  health,
  sourcesCount,
}: {
  onNavigate: (page: any) => void;
  health: HealthResponse | null;
  sourcesCount: number;
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#211B5F]/5 px-3 py-1 text-xs font-semibold text-[#211B5F]">
            <SearchCheck className="h-4 w-4" />
            Clean, focused experience
          </div>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            A simple election learning space with a calm, modern layout.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            This screen is designed to guide users through the main features with clarity,
            strong hierarchy, and a polished visual flow.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="inline-flex items-center gap-2 rounded-full bg-[#211B5F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Open Chat Coach <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('guide')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Generate Guide
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <StatusPill
              label={health?.country_scope ?? 'India-only experience'}
              tone="info"
            />
            <StatusPill label="Source-backed content" tone="good" />
            <StatusPill label="Fast navigation" tone="neutral" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[#0f172a] p-8 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <CircleGauge className="h-6 w-6 text-sky-300" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Overview
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-slate-300">Experience</p>
              <p className="text-2xl font-bold">Focused and clean</p>
            </div>

            <div>
              <p className="text-sm text-slate-300">Style</p>
              <p className="text-lg font-semibold">Modern card-based layout</p>
            </div>

            <div>
              <p className="text-sm text-slate-300">Access</p>
              <p className="text-lg font-semibold">Simple feature entry points</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ key, title, desc, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key as any)}
            className="group rounded-[2rem] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Icon className="h-6 w-6 text-[#211B5F]" />
              </span>
              <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
          </button>
        ))}
      </section>
    </div>
  );
}