import type { PropsWithChildren } from 'react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-signal">Offline GPX Navigator</p>
            <h1 className="text-lg font-semibold leading-tight text-slate-950">Route computer</h1>
          </div>
          <div className="rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
            PWA ready
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6">{children}</main>
    </div>
  );
}
