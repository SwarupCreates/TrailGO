import type { NavigationState } from '../types/navigation';
import type { RouteMetrics } from '../types/route';
import type { LiveLocation } from '../types/sensors';
import { formatDistance, formatSpeed } from '../services/navigation/navigationService';

type RideStatsProps = {
  metrics?: RouteMetrics;
  location?: LiveLocation;
  navigation?: NavigationState;
};

export function RideStats({ metrics, location, navigation }: RideStatsProps) {
  const stats = [
    {
      label: 'Speed',
      value: formatSpeed(location?.speedMetersPerSecond ?? 0),
    },
    {
      label: 'Route',
      value: formatDistance(metrics?.distanceMeters ?? 0),
    },
    {
      label: 'Remaining',
      value: formatDistance(navigation?.remainingDistanceMeters ?? metrics?.distanceMeters ?? 0),
    },
    {
      label: 'Accuracy',
      value: location ? `${Math.round(location.accuracyMeters)} m` : '--',
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}
