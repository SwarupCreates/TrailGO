import type { NavigationState } from '../types/navigation';
import type { GpxRoute, RouteMetrics } from '../types/route';
import { formatDistance } from '../services/navigation/navigationService';

type RouteSummaryProps = {
  route?: GpxRoute;
  metrics?: RouteMetrics;
  navigation?: NavigationState;
};

export function RouteSummary({ route, metrics, navigation }: RouteSummaryProps) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{route?.name ?? 'No GPX route loaded'}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {route ? `${route.points.length.toLocaleString()} points and ${route.waypoints.length} waypoints` : 'Import a local GPX file to render the route.'}
          </p>
        </div>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {navigation?.offRoute ? 'Off route' : 'Ready'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Distance</p>
          <p className="font-semibold text-slate-900">{formatDistance(metrics?.distanceMeters ?? 0)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Ascent</p>
          <p className="font-semibold text-slate-900">{Math.round(metrics?.ascentMeters ?? 0)} m</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">ETA</p>
          <p className="font-semibold text-slate-900">{navigation?.eta ?? '--'}</p>
        </div>
      </div>
    </section>
  );
}
