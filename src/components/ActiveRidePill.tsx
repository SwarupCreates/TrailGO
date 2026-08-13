import { useEffect, useState } from 'react';
import { useNavigationStore } from '../app/navigationStore';

export function ActiveRidePill() {
  const endRide = useNavigationStore((state) => state.endRide);
  const rideStartTime = useNavigationStore((state) => state.rideStartTime);
  const activityType = useNavigationStore((state) => state.activityType);
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!rideStartTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const diffSeconds = Math.floor((now - rideStartTime) / 1000);
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;
      
      const formatted = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');
      
      setElapsed(formatted);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [rideStartTime]);

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-24 z-20 flex w-full justify-center px-5">
      <div className="pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/10 px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-orange-500">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'wght' 600" }}>
              {activityType === 'walk' ? 'directions_walk' : 'directions_bike'}
            </span>
          </div>
          <span className="text-sm font-semibold text-white tracking-wide">
            <span className="text-slate-400 font-medium mr-2">Elapsed</span>
            {elapsed}
          </span>
        </div>
        <button
          onClick={endRide}
          className="flex h-8 items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-red-500 transition-colors hover:bg-red-500/40"
        >
          <span className="text-xs font-bold tracking-wide">End Ride</span>
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'wght' 600" }}>close</span>
        </button>
      </div>
    </div>
  );
}
