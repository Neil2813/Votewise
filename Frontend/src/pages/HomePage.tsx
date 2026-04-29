import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Menu,
  X,
  Vote,
  FileText,
  Search,
  Upload,
  MapPin,
  Gauge,
  MonitorPlay,
  MessageSquareText,
  BadgeAlert,
  Landmark,
} from 'lucide-react';

type Page = 'home' | 'guide' | 'compare' | 'simulator' | 'misinformation' | 'readiness';

type NavItem = {
  label: string;
  value: Page;
};

const navItems: NavItem[] = [
  { label: 'HOME', value: 'home' },
  { label: 'ELECTION GUIDE', value: 'guide' },
  { label: 'COMPARE CANDIDATES', value: 'compare' },
  { label: 'SIMULATOR', value: 'simulator' },
  { label: 'MISINFORMATION CHECK', value: 'misinformation' },
  { label: 'READINESS SCORE', value: 'readiness' },
];

const quickCards = [
  { key: 'guide', title: 'Election Guide', desc: 'A clean walkthrough of the election process.', icon: FileText },
  { key: 'compare', title: 'Compare Candidates', desc: 'Neutral comparison layout for policy and background.', icon: Landmark },
  { key: 'simulator', title: 'Simulator', desc: 'Simple step-by-step voting flow practice screen.', icon: MonitorPlay },
  { key: 'misinformation', title: 'Misinformation Check', desc: 'A claim verification interface with clear verdict display.', icon: BadgeAlert },
] as const;

const checklistItems = [
  { checked: true, title: 'Voter Registration Active', desc: 'Confirmed registration at current residential address.' },
  { checked: true, title: 'Valid Identification Secured', desc: 'Government-issued ID kept ready for verification.' },
  { checked: true, title: 'Polling Location Verified', desc: 'Assigned polling place checked in advance.' },
  { checked: false, title: 'Candidate Research Completed', desc: 'Reviewed the available options and background.' },
  { checked: false, title: 'Ballot Measures Understood', desc: 'Read the issues and measures relevant to the election.' },
] as const;

const missingSteps = [
  {
    title: 'Research Candidates',
    desc: 'Review candidate profiles and compare the key points.',
  },
  {
    title: 'Review Measures',
    desc: 'Read the election guide before voting day.',
  },
] as const;

function Header({ currentPage, setCurrentPage }: { currentPage: Page; setCurrentPage: (p: Page) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b-4 border-[#E31E24] bg-[#211B5F] text-white shadow-sm">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-3"
          >
            <Vote className="h-8 w-8" />
            <span className="text-xl font-black tracking-tight">VOTEWISE AI</span>
          </button>

          <nav className="hidden items-center gap-8 xl:flex">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCurrentPage(item.value)}
                className={`relative pb-2 text-[15px] font-extrabold tracking-[0.08em] transition ${
                  currentPage === item.value ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
                {currentPage === item.value ? (
                  <span className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-white" />
                ) : null}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-none border border-white/20 p-2 xl:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-[#211B5F] px-4 py-3 xl:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setCurrentPage(item.value);
                    setMobileOpen(false);
                  }}
                  className={`px-4 py-3 text-left text-sm font-bold tracking-wide ${
                    currentPage === item.value ? 'bg-white/10 text-white' : 'text-white/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-[#d8d8e5] bg-white">
      <div className="mx-auto flex max-w-[1380px] flex-col gap-4 px-6 py-8 text-sm text-[#2d3563] md:flex-row md:items-center md:justify-between lg:px-10">
        <p className="font-medium">This is an educational platform. Not affiliated with any government body.</p>
        <div className="flex flex-wrap gap-6 font-medium text-[#334155]">
          <a href="#" className="hover:text-[#211B5F]">About</a>
          <a href="#" className="hover:text-[#211B5F]">Privacy</a>
          <a href="#" className="hover:text-[#211B5F]">Terms</a>
          <a href="#" className="hover:text-[#211B5F]">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function HomePreview({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="space-y-8">
      <section className="rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm lg:p-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-none border border-[#211B5F]/15 bg-[#211B5F]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#211B5F]">
          <Search className="h-4 w-4" />
          Design-only interface
        </div>
        <h1 className="max-w-4xl text-4xl font-black tracking-tight text-[#111827] md:text-5xl">
          India election education with a clean, neutral, and accessible layout.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#475569] md:text-lg">
          This version focuses only on the visual structure. No backend details, no API labels, and no technical stack are shown in the frontend.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('readiness')}
            className="rounded-none bg-[#211B5F] px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white"
          >
            Open Readiness Screen
          </button>
          <button
            type="button"
            onClick={() => onNavigate('guide')}
            className="rounded-none border border-[#d6d8e6] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#334155]"
          >
            Open Guide Layout
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickCards.map(({ key, title, desc, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate(key as Page)}
            className="group rounded-none border border-[#d6d8e6] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-none bg-[#f3f4fb]">
                <Icon className="h-6 w-6 text-[#211B5F]" />
              </span>
              <span className="text-xl text-[#94a3b8] transition group-hover:translate-x-0.5">→</span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#111827]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">{desc}</p>
          </button>
        ))}
      </section>
    </div>
  );
}

function GuideLayout() {
  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
      <aside className="rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm">
        <div className="mb-6 border-t-4 border-[#211B5F] pt-5">
          <h2 className="text-2xl font-black uppercase tracking-[0.06em] text-[#111827]">Election Guide</h2>
        </div>

        <div className="space-y-5 text-sm text-[#475569]">
          <div className="rounded-none border border-[#e4e7f0] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#211B5F]">Step 1</p>
            <p className="mt-2 font-semibold text-[#111827]">Eligibility</p>
            <p className="mt-1">Simple informational panel with placeholder guidance text.</p>
          </div>
          <div className="rounded-none border border-[#e4e7f0] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#211B5F]">Step 2</p>
            <p className="mt-2 font-semibold text-[#111827]">Registration</p>
            <p className="mt-1">Minimal layout card for the registration process.</p>
          </div>
          <div className="rounded-none border border-[#e4e7f0] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#211B5F]">Step 3</p>
            <p className="mt-2 font-semibold text-[#111827]">Poll-day process</p>
            <p className="mt-1">Reserved space for a clean step-by-step summary.</p>
          </div>
        </div>
      </aside>

      <div className="space-y-6 rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm">
        <div className="border-b border-[#ececf5] pb-4">
          <h2 className="text-2xl font-black text-[#111827]">Guide Layout Panel</h2>
          <p className="mt-2 text-[#475569]">Pure presentation layer with no backend annotations.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {['Eligibility', 'Registration', 'Nomination', 'Do’s and Don’ts'].map((item) => (
            <div key={item} className="rounded-none border border-[#e4e7f0] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#211B5F]">{item}</p>
              <div className="mt-3 h-24 rounded-none bg-[#f8f9ff]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareLayout() {
  return (
    <div className="rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Landmark className="h-6 w-6 text-[#211B5F]" />
        <h2 className="text-2xl font-black text-[#111827]">Comparison Layout</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-[#211B5F] text-xs uppercase tracking-[0.18em] text-[#334155]">
              <th className="p-4">Aspect</th>
              <th className="p-4">Left</th>
              <th className="p-4">Right</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Format', 'Rule summary', 'Rule summary'],
              ['Tone', 'Neutral', 'Neutral'],
              ['Output', 'Clear comparison card', 'Clear comparison card'],
              ['Purpose', 'Information only', 'Information only'],
            ].map(([a, b, c]) => (
              <tr key={a} className="border-b border-[#ececf5]">
                <td className="p-4 font-semibold text-[#111827]">{a}</td>
                <td className="p-4 text-[#475569]">{b}</td>
                <td className="p-4 text-[#475569]">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MisinformationLayout() {
  return (
    <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-6">
        <section className="rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BadgeAlert className="h-6 w-6 text-[#211B5F]" />
            <h2 className="text-2xl font-black text-[#111827]">Claim Checker Layout</h2>
          </div>
          <textarea
            className="min-h-[180px] w-full rounded-none border border-[#d6d8e6] p-4 text-sm outline-none"
            placeholder="Paste a claim here..."
            readOnly
          />
          <button className="mt-4 inline-flex items-center gap-2 rounded-none bg-[#211B5F] px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white">
            Analyze <Search className="h-4 w-4" />
          </button>
        </section>

        <section className="rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm">
          <h3 className="border-b border-[#ececf5] pb-4 text-2xl font-black text-[#111827]">Verdict Panel</h3>
          <div className="mt-5 flex items-center gap-3 rounded-none border border-[#ececf5] bg-[#fafafa] p-4">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#334155]">Status</span>
            <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#E31E24]">
              <AlertTriangle className="h-4 w-4" /> Potentially Unreliable
            </span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#211B5F]">Explanation</p>
            <p className="mt-3 border-l-4 border-[#d6d8e6] bg-[#f8f9ff] p-4 text-sm leading-7 text-[#334155]">
              This is a static design layout for the misinformation page. The content area is reserved for the final verdict and explanation.
            </p>
          </div>
        </section>
      </div>

      <aside className="rounded-none border border-[#d6d8e6] bg-white shadow-sm">
        <div className="border-b border-[#ececf5] bg-[#fafafa] p-5">
          <h3 className="text-2xl font-black text-[#111827]">Verification Tips</h3>
        </div>
        <div className="divide-y divide-[#ececf5]">
          {[
            'Verify against official sources.',
            'Check the publication date.',
            'Look for independent confirmation.',
            'Watch for emotional or exaggerated wording.',
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-4 p-5">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#211B5F]" />
              <p className="text-sm leading-6 text-[#475569]">{tip}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function SimulatorLayout() {
  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-[#111827]">Voting Simulation</h2>
        <p className="mt-2 text-[#475569]">Step-based visual flow only.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {['Identity Verification', 'Select Candidate', 'Confirm Vote'].map((step, idx) => (
            <div key={step} className="rounded-none border border-[#e4e7f0] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#211B5F]">Step {idx + 1}</p>
              <p className="mt-2 font-semibold text-[#111827]">{step}</p>
              <div className="mt-4 h-24 rounded-none bg-[#f8f9ff]" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm">
        <div className="rounded-none border border-[#e4e7f0] bg-[#f8f9ff] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#211B5F]">Simulation Status</p>
          <p className="mt-3 text-lg font-semibold text-[#111827]">This is a training layout.</p>
          <p className="mt-2 text-sm leading-6 text-[#475569]">No actual submission or backend detail is shown here.</p>
        </div>
      </div>
    </div>
  );
}

function ReadinessScreen() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm">
        <div className="border-t-4 border-[#211B5F] pt-3">
          <h2 className="text-2xl font-black uppercase tracking-[0.08em] text-[#111827]">Preparation Checklist</h2>
        </div>

        <div className="mt-6 divide-y divide-[#dfe2ee] border border-[#d6d8e6]">
          {checklistItems.map((item, index) => (
            <label
              key={item.title}
              className={`flex cursor-pointer items-start gap-4 px-5 py-5 transition ${!item.checked ? 'bg-[#fafafa]' : 'bg-white'}`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                readOnly
                className="mt-1 h-5 w-5 rounded-none border-[#211B5F] text-[#211B5F] accent-[#211B5F]"
              />
              <div>
                <p className="font-bold text-[#111827]">{item.title}</p>
                <p className="mt-1 text-sm text-[#475569]">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-none border border-[#d6d8e6] bg-white p-8 text-center shadow-sm">
          <div className="border-t-4 border-[#211B5F] pt-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#334155]">Current Status</p>
          </div>
          <p className="mt-8 text-7xl font-black tracking-tight text-[#211B5F]">60%</p>
          <p className="mt-5 text-2xl font-black text-[#E31E24]">Not Fully Ready</p>
          <p className="mx-auto mt-4 max-w-xs text-base leading-7 text-[#475569]">
            Action is required to ensure a smooth voting experience.
          </p>
        </section>

        <section className="rounded-none border border-[#d6d8e6] bg-white p-8 shadow-sm">
          <div className="border-t-4 border-[#E31E24] pt-3">
            <h3 className="text-2xl font-black uppercase tracking-[0.06em] text-[#111827]">Missing Steps</h3>
          </div>
          <div className="mt-6 space-y-6">
            {missingSteps.map((step) => (
              <div key={step.title} className="flex items-start gap-4 border-b border-[#ececf5] pb-5 last:border-b-0 last:pb-0">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#E31E24]" />
                <div>
                  <p className="font-bold text-[#111827]">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#475569]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-8 w-full rounded-none bg-[#211B5F] px-5 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white"
          >
            View Election Guide
          </button>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('readiness');

  const content = useMemo(() => {
    switch (currentPage) {
      case 'home':
        return <HomePreview onNavigate={setCurrentPage} />;
      case 'guide':
        return <GuideLayout />;
      case 'compare':
        return <CompareLayout />;
      case 'simulator':
        return <SimulatorLayout />;
      case 'misinformation':
        return <MisinformationLayout />;
      case 'readiness':
      default:
        return <ReadinessScreen />;
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-[#f8f8fb] text-[#111827]">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="mx-auto max-w-[1380px] px-6 py-10 lg:px-10">
        {currentPage === 'readiness' ? (
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight text-[#111827] md:text-5xl">Am I Ready to Vote?</h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#475569]">
              Complete the institutional checklist below to determine your electoral preparedness.
            </p>
          </div>
        ) : null}
        {content}
      </main>

      <Footer />
    </div>
  );
}
