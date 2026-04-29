import { cx } from '../lib/utils';

export function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'good' | 'warn' | 'danger' | 'info';
}) {
  const toneClass =
    tone === 'good'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : tone === 'warn'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : tone === 'danger'
          ? 'bg-rose-100 text-rose-800 border-rose-200'
          : tone === 'info'
            ? 'bg-sky-100 text-sky-800 border-sky-200'
            : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={cx('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', toneClass)}>
      {label}
    </span>
  );
}
