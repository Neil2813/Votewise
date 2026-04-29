import {
  ArrowRight,
  FileText,
  MessageSquareText,
  BadgeAlert,
  Gauge,
  MonitorPlay,
  Landmark,
} from 'lucide-react';

export function HomePage({ onNavigate }: { onNavigate: (page: any) => void }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-10">
      
      {/* HERO SECTION */}
      <section className="mx-auto max-w-5xl text-center">
        
        <p className="mb-3 text-sm font-semibold text-[#211B5F]">
          VOTEWISE AI
        </p>

        <h1 className="text-4xl font-black text-slate-900 md:text-5xl leading-tight">
          Understand elections.
          <br />
          Vote with clarity.
        </h1>

        <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
          A clean, focused space to explore election concepts, verify claims,
          and prepare yourself with confidence.
        </p>

        {/* PRIMARY ACTIONS */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => onNavigate('chat')}
            className="rounded-full bg-[#211B5F] px-6 py-3 text-white font-semibold flex items-center gap-2 hover:opacity-95"
          >
            Start Chat <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => onNavigate('guide')}
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-white"
          >
            Generate Guide
          </button>
        </div>
      </section>

      {/* SIMPLE FEATURE LIST (NOT CARDS GRID CHAOS) */}
      <section className="mx-auto mt-14 max-w-4xl">
        
        <h2 className="text-sm font-semibold text-slate-500 mb-6">
          EXPLORE FEATURES
        </h2>

        <div className="divide-y rounded-xl border bg-white">
          
          {/* ITEM */}
          <FeatureRow
            icon={<MessageSquareText />}
            title="Chat Coach"
            desc="Ask questions and get clear explanations."
            onClick={() => onNavigate('chat')}
          />

          <FeatureRow
            icon={<FileText />}
            title="Guide Generator"
            desc="Create simplified election guides."
            onClick={() => onNavigate('guide')}
          />

          <FeatureRow
            icon={<Landmark />}
            title="Neutral Compare"
            desc="Understand differences without bias."
            onClick={() => onNavigate('compare')}
          />

          <FeatureRow
            icon={<BadgeAlert />}
            title="Fact Check"
            desc="Verify claims and misinformation."
            onClick={() => onNavigate('misinformation')}
          />

          <FeatureRow
            icon={<Gauge />}
            title="Readiness"
            desc="Check your voting preparedness."
            onClick={() => onNavigate('readiness')}
          />

          <FeatureRow
            icon={<MonitorPlay />}
            title="Simulator"
            desc="Practice the voting flow step by step."
            onClick={() => onNavigate('simulate')}
          />
        </div>
      </section>
    </div>
  );
}

/* CLEAN ROW COMPONENT INSTEAD OF HEAVY CARDS */
function FeatureRow({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: any;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
    >
      <div className="flex items-center gap-4 text-left">
        <div className="p-2 rounded-lg bg-slate-100 text-[#211B5F]">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{desc}</p>
        </div>
      </div>

      <ArrowRight className="h-4 w-4 text-slate-400" />
    </button>
  );
}