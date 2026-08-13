import type { Waypoint } from '../types/route';

type WaypointListProps = {
  waypoints: Waypoint[];
};

export function WaypointList({ waypoints }: WaypointListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Waypoints</h2>
      <div className="mt-4 space-y-2">
        {waypoints.length ? (
          waypoints.slice(0, 6).map((waypoint) => (
            <div key={waypoint.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/50">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{waypoint.name}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{waypoint.symbol ?? 'Waypoint'}</p>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500">
                {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)}
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No waypoints found in the loaded route.</p>
          </div>
        )}
      </div>
    </section>
  );
}
