import { create } from 'zustand';
import type { GpxRoute, RouteMetrics } from '../types/route';
import type { LiveLocation, DeviceAttitude } from '../types/sensors';
import type { NavigationState } from '../types/navigation';

type TrackingStatus = 'idle' | 'watching' | 'error';

type NavigationStore = {
  activeRoute?: GpxRoute;
  routeMetrics?: RouteMetrics;
  approachRoute?: GpxRoute;
  navigationState?: NavigationState;
  liveLocation?: LiveLocation;
  deviceAttitude?: DeviceAttitude;
  bottomUIHeight: number;
  isRiding: boolean;
  rideStartTime: number | null;
  isRidePaused: boolean;
  activityType: 'walk' | 'bike';
  trackingStatus: TrackingStatus;
  trackingError?: string;
  compassMode: 'user' | 'compass';
  isFollowing: boolean;
  mapActions: { recenter: () => void; toggleCompass: () => void } | null;
  setActiveRoute: (route: GpxRoute, metrics: RouteMetrics) => void;
  setNavigationState: (state: NavigationState) => void;
  setLiveLocation: (location: LiveLocation) => void;
  setDeviceAttitude: (attitude: DeviceAttitude) => void;
  setActivityType: (activityType: 'walk' | 'bike') => void;
  setApproachRoute: (route?: GpxRoute) => void;
  setTrackingStatus: (status: TrackingStatus, error?: string) => void;
  setBottomUIHeight: (height: number) => void;
  startRide: () => void;
  pauseRide: () => void;
  resumeRide: () => void;
  endRide: () => void;
  resetRoute: () => void;
  setCompassMode: (mode: 'user' | 'compass') => void;
  setIsFollowing: (following: boolean) => void;
  setMapActions: (actions: { recenter: () => void; toggleCompass: () => void } | null) => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  trackingStatus: 'idle',
  activityType: 'bike',
  bottomUIHeight: 120,
  isRiding: false,
  rideStartTime: null,
  isRidePaused: false,
  compassMode: 'user',
  isFollowing: true,
  mapActions: null,
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
  setBottomUIHeight: (bottomUIHeight) => set({ bottomUIHeight }),
  startRide: () => set({ isRiding: true, rideStartTime: Date.now(), isRidePaused: false }),
  pauseRide: () => set({ isRidePaused: true }),
  resumeRide: () => set({ isRidePaused: false }),
  endRide: () => set({ isRiding: false, rideStartTime: null, isRidePaused: false }),
  resetRoute: () =>
    set({
      activeRoute: undefined,
      routeMetrics: undefined,
      approachRoute: undefined,
      navigationState: undefined,
      isRiding: false,
      rideStartTime: null,
      isRidePaused: false,
    }),
  setActivityType: (activityType) => set({ activityType }),
  setApproachRoute: (approachRoute) => set({ approachRoute }),
  setCompassMode: (compassMode) => set({ compassMode }),
  setIsFollowing: (isFollowing) => set({ isFollowing }),
  setMapActions: (mapActions) => set({ mapActions }),
}));
