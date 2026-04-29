import { useMemo } from 'react';
import { Bot, Globe, ShieldAlert, ShieldCheck, Sparkles, Vote, ClipboardList, MessageSquareText, Scale, BadgeAlert, Gauge, MonitorPlay } from 'lucide-react';
import type { PageKey } from '../lib/types';
import { cx } from '../lib/utils';

const NAV = [
  { key: 'home', label: 'Home', icon: Vote },
  { key: 'chat', label: 'Chat Coach', icon: MessageSquareText },
  { key: 'guide', label: 'Guide', icon: ClipboardList },
  { key: 'compare', label: 'Compare', icon: Scale },
  { key: 'misinformation', label: 'Fact Check', icon: BadgeAlert },
  { key: 'readiness', label: 'Readiness', icon: Gauge },
  { key: 'simulate', label: 'Simulator', icon: MonitorPlay },
] as const satisfies ReadonlyArray<{ key: PageKey; label: string; icon: React.ComponentType<{ className?: string }> }>;

export function Layout({
  currentPage,
  onNavigate,
  healthState,
  children,
}: {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  healthState: 'loading' | 'healthy' | 'degraded';
  children: React.ReactNode;
}) {
  const statusLabel = useMemo(() => {
    if (healthState === 'healthy') return 'Backend connected';
    if (healthState === 'degraded') return 'Backend unavailable';
    return 'Checking backend...';
  }, [healthState]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_28%,#f8fafc_100%)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left"
            aria-label="Go to home"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#211B5F] text-white shadow-sm">
              <Vote className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.2em] text-slate-500">VOTEWISE AI</span>
              <span className="block text-lg font-bold text-slate-900">India-only election education</span>
            </span>
          </button>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
              {healthState === 'healthy' ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : healthState === 'degraded' ? <ShieldAlert className="h-4 w-4 text-rose-600" /> : <Sparkles className="h-4 w-4 text-slate-600" />}
              {statusLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
              <Globe className="h-4 w-4 text-[#211B5F]" />
              India-only scope
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
              <Bot className="h-4 w-4 text-[#E31E24]" />
              Retrieval first
            </span>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4 md:px-6">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = currentPage === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={cx(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                  active
                    ? 'border-[#211B5F] bg-[#211B5F] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:py-8">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-6">
          <p>This platform is educational, neutral, and India-only.</p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            No user data stored in a database
          </p>
        </div>
      </footer>
    </div>
  );
}
