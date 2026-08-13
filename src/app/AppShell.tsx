import type { PropsWithChildren } from 'react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="z-10 border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-signal">TrailGO</p>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-950 dark:text-slate-100">Route Computer</h1>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            PWA Ready
          </div>
        </div>
      </header>
      <main className="relative flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
