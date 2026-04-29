export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
      <span className="h-3 w-3 animate-pulse rounded-full bg-slate-400" />
      {label}
    </div>
  );
}
