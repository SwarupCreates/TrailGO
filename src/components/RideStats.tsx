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
      value: formatSpeed(location?.speedMetersPerSecond ?? 0).split(' '), // split into ['0.0', 'km/h']
    },
    {
      label: 'Route',
      value: formatDistance(metrics?.distanceMeters ?? 0).split(' '),
    },
    {
      label: 'Remaining',
      value: formatDistance(navigation?.remainingDistanceMeters ?? metrics?.distanceMeters ?? 0).split(' '),
    },
    {
      label: 'Accuracy',
      value: location ? [`${Math.round(location.accuracyMeters)}`, 'm'] : ['--', ''],
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <p className="text-4xl font-black tabular-nums tracking-tighter text-slate-950 dark:text-white">{stat.value[0]}</p>
            {stat.value[1] && <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.value[1]}</p>}
          </div>
        </div>
      ))}
    </section>
  );
}
