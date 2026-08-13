import type { Waypoint } from '../types/route';

type WaypointListProps = {
  waypoints: Waypoint[];
};

export function WaypointList({ waypoints }: WaypointListProps) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Waypoints</h2>
      <div className="mt-3 space-y-2">
        {waypoints.length ? (
          waypoints.slice(0, 6).map((waypoint) => (
            <div key={waypoint.id} className="flex items-center justify-between gap-3 rounded bg-slate-50 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{waypoint.name}</p>
                <p className="text-xs text-slate-500">{waypoint.symbol ?? 'Waypoint'}</p>
              </div>
              <span className="text-xs text-slate-500">
                {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600">No waypoints found in the loaded route.</p>
        )}
      </div>
    </section>
  );
}
