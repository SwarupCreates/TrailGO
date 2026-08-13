import { useState } from 'react';
import { useNavigationStore } from '../app/navigationStore';
import { ElevationProfile } from '../components/ElevationProfile';
import { GpxImportButton } from '../components/GpxImportButton';
import { MapViewport } from '../components/MapViewport';
import { RideStats } from '../components/RideStats';
import { RouteSummary } from '../components/RouteSummary';
import { WaypointList } from '../components/WaypointList';
import { useLiveNavigation } from '../hooks/useLiveNavigation';
import { useLiveSensors } from '../hooks/useLiveSensors';

export function NavigationPage() {
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const activeRoute = useNavigationStore((state) => state.activeRoute);
  const routeMetrics = useNavigationStore((state) => state.routeMetrics);
  const liveLocation = useNavigationStore((state) => state.liveLocation);
  const navigationState = useNavigationStore((state) => state.navigationState);
  const trackingStatus = useNavigationStore((state) => state.trackingStatus);
  const trackingError = useNavigationStore((state) => state.trackingError);

  useLiveSensors(trackingEnabled);
  useLiveNavigation();

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-h-[420px] overflow-hidden">
        <MapViewport route={activeRoute} location={liveLocation} />
      </section>

      <aside className="space-y-4">
        <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Ride controls</h2>
              <p className="mt-1 text-xs text-slate-500">Import a route and enable device sensors.</p>
            </div>
            <button
              type="button"
              onClick={() => setTrackingEnabled((current) => !current)}
              className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {trackingEnabled ? 'Stop GPS' : 'Start GPS'}
            </button>
          </div>
          <div className="mt-4">
            <GpxImportButton />
          </div>
          <p className="mt-3 text-xs text-slate-500">Sensor status: {trackingStatus}</p>
          {trackingError ? <p className="mt-2 text-xs font-medium text-red-600">{trackingError}</p> : null}
        </div>

        <RouteSummary route={activeRoute} metrics={routeMetrics} navigation={navigationState} />
        <RideStats metrics={routeMetrics} location={liveLocation} navigation={navigationState} />
        <ElevationProfile points={activeRoute?.points ?? []} />
        <WaypointList waypoints={activeRoute?.waypoints ?? []} />
      </aside>
    </div>
  );
}
