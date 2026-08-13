import { create } from 'zustand';
import type { GpxRoute, RouteMetrics } from '../types/route';
import type { LiveLocation, DeviceAttitude } from '../types/sensors';
import type { NavigationState } from '../types/navigation';

type TrackingStatus = 'idle' | 'watching' | 'error';

type NavigationStore = {
  activeRoute?: GpxRoute;
  routeMetrics?: RouteMetrics;
  navigationState?: NavigationState;
  liveLocation?: LiveLocation;
  deviceAttitude?: DeviceAttitude;
  trackingStatus: TrackingStatus;
  trackingError?: string;
  setActiveRoute: (route: GpxRoute, metrics: RouteMetrics) => void;
  setNavigationState: (state: NavigationState) => void;
  setLiveLocation: (location: LiveLocation) => void;
  setDeviceAttitude: (attitude: DeviceAttitude) => void;
  setTrackingStatus: (status: TrackingStatus, error?: string) => void;
  resetRoute: () => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  trackingStatus: 'idle',
  setActiveRoute: (activeRoute, routeMetrics) =>
    set({
      activeRoute,
      routeMetrics,
      navigationState: undefined,
    }),
  setNavigationState: (navigationState) => set({ navigationState }),
  setLiveLocation: (liveLocation) => set({ liveLocation }),
  setDeviceAttitude: (deviceAttitude) => set({ deviceAttitude }),
  setTrackingStatus: (trackingStatus, trackingError) => set({ trackingStatus, trackingError }),
  resetRoute: () =>
    set({
      activeRoute: undefined,
      routeMetrics: undefined,
      navigationState: undefined,
    }),
}));
