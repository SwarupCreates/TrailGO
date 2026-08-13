import type { RoutePoint } from '../types/route';

type ElevationProfileProps = {
  points: RoutePoint[];
};

export function ElevationProfile({ points }: ElevationProfileProps) {
  const pointsWithElevation = points.filter((point) => typeof point.elevationMeters === 'number');
  const elevations = pointsWithElevation.map((point) => point.elevationMeters as number);
  const min = elevations.length ? Math.min(...elevations) : 0;
  const max = elevations.length ? Math.max(...elevations) : 1;
  const range = Math.max(max - min, 1);
  const sampled = pointsWithElevation.filter((_, index) => index % Math.max(Math.floor(pointsWithElevation.length / 60), 1) === 0);

  const polyline = sampled
    .map((point, index) => {
      const x = sampled.length <= 1 ? 0 : (index / (sampled.length - 1)) * 100;
      const y = 100 - (((point.elevationMeters ?? min) - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Elevation</h2>
        <span className="text-xs text-slate-500">
          {Math.round(min)}m to {Math.round(max)}m
        </span>
      </div>
      <div className="h-24 rounded bg-slate-100">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <polyline points={polyline} fill="none" stroke="#22c55e" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </section>
  );
}
