import { useEffect } from 'react';
import { useNavigationStore } from '../app/navigationStore';
import { startGpsWatch, subscribeToDeviceOrientation } from '../services/gps/gpsService';

export function useLiveSensors(enabled: boolean) {
  const setLiveLocation = useNavigationStore((state) => state.setLiveLocation);
  const setDeviceAttitude = useNavigationStore((state) => state.setDeviceAttitude);
  const setTrackingStatus = useNavigationStore((state) => state.setTrackingStatus);

  useEffect(() => {
    if (!enabled) {
      setTrackingStatus('idle');
      return undefined;
    }

    setTrackingStatus('watching');

    const stopGps = startGpsWatch({
      onLocation: setLiveLocation,
      onError: (error) => setTrackingStatus('error', error.message),
    });
    const stopOrientation = subscribeToDeviceOrientation(setDeviceAttitude);

    return () => {
      stopGps();
      stopOrientation();
      setTrackingStatus('idle');
    };
  }, [enabled, setDeviceAttitude, setLiveLocation, setTrackingStatus]);
}
