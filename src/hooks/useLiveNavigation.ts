import { useEffect } from 'react';
import { useNavigationStore } from '../app/navigationStore';
import { createNavigationState } from '../services/navigation/navigationService';

export function useLiveNavigation() {
  const activeRoute = useNavigationStore((state) => state.activeRoute);
  const liveLocation = useNavigationStore((state) => state.liveLocation);
  const setNavigationState = useNavigationStore((state) => state.setNavigationState);

  useEffect(() => {
    if (!activeRoute || !liveLocation) {
      return;
    }

    setNavigationState(createNavigationState(activeRoute, liveLocation));
  }, [activeRoute, liveLocation, setNavigationState]);
}
