import { useState, useEffect } from 'react';
import { useNavigationStore } from '../app/navigationStore';
import { fetchOsrmRoute } from '../services/navigation/osrmService';
import { MapViewport } from '../components/MapViewport';
import { TopBar } from '../components/TopBar';
import { ActiveRoutePill } from '../components/ActiveRoutePill';
import { ActiveRidePill } from '../components/ActiveRidePill';
import { ActiveRideStatsOverlay } from '../components/ActiveRideStatsOverlay';
import { MapControls } from '../components/MapControls';
import { RideBottomSheet } from '../components/RideBottomSheet';
import { WelcomeIdleState } from '../components/WelcomeIdleState';
import { BottomNav } from '../components/BottomNav';
import { ActivityToggle } from '../components/ActivityToggle';
import { useLiveNavigation } from '../hooks/useLiveNavigation';
import { useLiveSensors } from '../hooks/useLiveSensors';
import { useWeather } from '../hooks/useWeather';

export function NavigationPage() {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  
  const activeRoute = useNavigationStore((state) => state.activeRoute);
  const routeMetrics = useNavigationStore((state) => state.routeMetrics);
  const liveLocation = useNavigationStore((state) => state.liveLocation);
  const resetRoute = useNavigationStore((state) => state.resetRoute);
  const approachRoute = useNavigationStore((state) => state.approachRoute);
  const setApproachRoute = useNavigationStore((state) => state.setApproachRoute);
  const activityType = useNavigationStore((state) => state.activityType);
  const isRiding = useNavigationStore((state) => state.isRiding);
  const startRide = useNavigationStore((state) => state.startRide);

  const { weather } = useWeather(liveLocation);

  useEffect(() => {
    if (!activeRoute || !activeRoute.points.length || !liveLocation) {
      setApproachRoute(undefined);
      return;
    }

    const startPoint = activeRoute.points[0];
    const distanceToStart = Math.sqrt(
      Math.pow(liveLocation.latitude - startPoint.latitude, 2) + 
      Math.pow(liveLocation.longitude - startPoint.longitude, 2)
    ) * 111320; // approximate meters

    // Only calculate approach if further than 50 meters
    if (distanceToStart > 50) {
      fetchOsrmRoute([
        { latitude: liveLocation.latitude, longitude: liveLocation.longitude },
        { latitude: startPoint.latitude, longitude: startPoint.longitude }
      ], activityType || 'bike')
        .then((route) => setApproachRoute(route))
        .catch(console.error);
    } else {
      setApproachRoute(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoute, activityType]);

  useLiveSensors(trackingEnabled);
  useLiveNavigation();

  const handleClearRoute = () => {
    resetRoute();
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black font-sans">
      <TopBar />
      
      {!activeRoute && <ActivityToggle />}
      
      {activeRoute && !isRiding && (
        <ActiveRoutePill 
          routeName={activeRoute.name || 'MyRoute.gpx'} 
          onClear={handleClearRoute} 
        />
      )}
      
      {activeRoute && isRiding && (
        <ActiveRidePill />
      )}

      {/* Map Background */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
        <MapViewport 
          route={activeRoute} 
          approachRoute={approachRoute}
          location={liveLocation} 
          useArrowMarker={isRiding} 
        />
        {/* Map Gradient Overlays */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-40 z-10 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[500px] z-10 bg-gradient-to-t from-black/90 to-transparent" />
      </div>

      {/* Map controls and active ride stats stack */}
      <div 
        className="pointer-events-none absolute left-0 right-0 z-20 flex flex-col justify-end gap-2 px-5 pb-5 transition-all duration-300"
        style={{ bottom: `${bottomUIHeight}px` }}
      >
        <div className="flex w-full justify-end">
          <MapControls />
        </div>
        
        {activeRoute && isRiding && (
          <ActiveRideStatsOverlay />
        )}
      </div>

      {activeRoute ? (
        <>
          <RideBottomSheet 
            metrics={routeMetrics}
            points={activeRoute?.points}
            routeName={activeRoute?.name}
            isTracking={isRiding}
            onStartTracking={startRide}
            weather={weather}
          />
        </>
      ) : (
        <>
          <WelcomeIdleState weather={weather} />
          <BottomNav />
        </>
      )}
    </div>
  );
}
