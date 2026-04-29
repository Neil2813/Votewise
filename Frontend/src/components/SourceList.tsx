import type { SourceHit } from '../lib/types';
import { prettyLabel } from '../lib/utils';

export function SourceList({ sources }: { sources: SourceHit[] }) {
  if (!sources.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        No source snippets were returned for this response.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source, index) => (
        <article key={`${source.source}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              {source.source}
            </span>
            {source.section ? (
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                {source.section}
              </span>
            ) : null}
            {source.kind ? (
              <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                {prettyLabel(source.kind)}
              </span>
            ) : null}
            {typeof source.score === 'number' ? (
              <span className="ml-auto text-xs text-slate-500">Score: {source.score.toFixed(2)}</span>
            ) : null}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{source.text}</p>
        </article>
      ))}
    </div>
  );
}
