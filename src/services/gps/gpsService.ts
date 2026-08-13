import type { DeviceAttitude, LiveLocation } from '../../types/sensors';

type GpsWatchOptions = {
  onLocation: (location: LiveLocation) => void;
  onError: (error: GeolocationPositionError) => void;
};

export function startGpsWatch({ onLocation, onError }: GpsWatchOptions) {
  if (!('geolocation' in navigator)) {
    onError({
      code: 2,
      message: 'Geolocation is not available on this device.',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);
    return () => undefined;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        altitudeMeters: position.coords.altitude,
        altitudeAccuracyMeters: position.coords.altitudeAccuracy,
        headingDegrees: position.coords.heading,
        speedMetersPerSecond: position.coords.speed,
        timestamp: position.timestamp,
      });
    },
    onError,
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000,
    },
  );

  return () => navigator.geolocation.clearWatch(watchId);
}

export function subscribeToDeviceOrientation(onAttitude: (attitude: DeviceAttitude) => void) {
  if (!('DeviceOrientationEvent' in window)) {
    return () => undefined;
  }

  const handleOrientation = (event: DeviceOrientationEvent) => {
    onAttitude({
      absolute: event.absolute,
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
      webkitCompassHeading: (event as any).webkitCompassHeading,
      timestamp: Date.now(),
    });
  };

  window.addEventListener('deviceorientation', handleOrientation);

  return () => window.removeEventListener('deviceorientation', handleOrientation);
}
