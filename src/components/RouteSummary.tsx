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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{route?.name ?? 'No GPX Route Loaded'}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {route ? `${route.points.length.toLocaleString()} points · ${route.waypoints.length} waypoints` : 'Import a local GPX file to render.'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
          navigation?.offRoute 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' 
            : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
        }`}>
          {navigation?.offRoute ? 'Off Route' : 'Ready'}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Distance</p>
          <p className="mt-1 font-black text-slate-900 dark:text-slate-100">{formatDistance(metrics?.distanceMeters ?? 0)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ascent</p>
          <p className="mt-1 font-black text-slate-900 dark:text-slate-100">{Math.round(metrics?.ascentMeters ?? 0)} m</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">ETA</p>
          <p className="mt-1 font-black text-slate-900 dark:text-slate-100">{navigation?.eta ?? '--'}</p>
        </div>
      </div>
    </section>
  );
}
