import { useState } from 'react';
import { ArrowRight, LockKeyhole, RotateCcw, UserCheck, Vote } from 'lucide-react';
import { simulate, isApiError } from '../lib/api';
import { StatusPill } from '../components/StatusPill';

export function SimulatorPage() {
  const [step, setStep] = useState<'identity' | 'selection' | 'confirmation'>('identity');
  const [fullName, setFullName] = useState('');
  const [voterId, setVoterId] = useState('');
  const [candidate, setCandidate] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('Start with the identity step.');
  const [mode, setMode] = useState<'backend' | 'local'>('backend');
  const [loading, setLoading] = useState(false);

  async function validate(currentStep: typeof step) {
    setLoading(true);
    try {
      let response;
      if (currentStep === 'identity') {
        response = await simulate('identity', { full_name: fullName, voter_id: voterId });
      } else if (currentStep === 'selection') {
        response = await simulate('selection', { candidate });
      } else {
        response = await simulate('confirmation', { confirmed });
      }
      setMessage(response.message);
      setMode(response.validated_locally ? 'backend' : 'local');
    } catch (err) {
      setMode('local');
      setMessage(
        isApiError(err)
          ? `Backend validation unavailable. Proceeding locally: ${err.message}`
          : 'Backend validation unavailable. Proceeding locally.'
      );
    } finally {
      setLoading(false);
    }
  }

  function advance() {
    if (step === 'identity') {
      validate('identity').then(() => setStep('selection'));
      return;
    }
    if (step === 'selection') {
      validate('selection').then(() => setStep('confirmation'));
      return;
    }
    validate('confirmation');
  }

  function onReset() {
    setStep('identity');
    setFullName('');
    setVoterId('');
    setCandidate('');
    setConfirmed(false);
    setMessage('Start with the identity step.');
    setMode('backend');
  }

  const cards = [
    { key: 'identity', title: 'Identity verification', icon: UserCheck },
    { key: 'selection', title: 'Candidate selection', icon: Vote },
    { key: 'confirmation', title: 'Confirm vote', icon: LockKeyhole },
  ] as const;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-slate-950">Voting Simulator</h1>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {cards.map(({ key, title, icon: Icon }) => {
            const active = step === key;
            return (
              <button
                key={key}
                onClick={() => setStep(key)}
                className={`rounded-[1.5rem] border p-4 text-left ${active ? 'border-[#211B5F] bg-[#211B5F] text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
              >
                <Icon className="h-5 w-5" />
                <p className="mt-2 text-sm font-semibold">{title}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
          {step === 'identity' ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-[#211B5F]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Voter ID</label>
                <input
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-[#211B5F]"
                />
              </div>
            </>
          ) : null}

          {step === 'selection' ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Candidate</label>
              <input
                value={candidate}
                onChange={(e) => setCandidate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-[#211B5F]"
                placeholder="Choose a sample candidate label"
              />
            </div>
          ) : null}

          {step === 'confirmation' ? (
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="h-5 w-5 accent-[#211B5F]" />
              Confirm the selection
            </label>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={advance}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#211B5F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              Validate and continue
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => validate(step)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Validate current step
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">Simulation status</h2>
            <StatusPill label={mode === 'backend' ? 'backend validated' : 'local fallback'} tone={mode === 'backend' ? 'good' : 'warn'} />
          </div>
          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm leading-7 text-slate-800">{message}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">Flow rules</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>Identity: both name and voter ID must be present.</li>
            <li>Selection: a candidate label is required.</li>
            <li>Confirmation: the final acknowledgement must be checked.</li>
            <li>If the backend fails, the frontend continues with local validation.</li>
          </ul>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            The simulator is frontend-first and only uses the backend when available for rule validation.
          </div>
        </section>
      </aside>
    </div>
  );
}
