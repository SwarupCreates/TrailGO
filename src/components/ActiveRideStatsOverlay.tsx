import { useNavigationStore } from '../app/navigationStore';
import { formatSpeed } from '../services/navigation/navigationService';
import type { TurnInstructionType } from '../types/navigation';

function getTurnIcon(type?: TurnInstructionType) {
  switch (type) {
    case 'start': return 'start';
    case 'continue': return 'straight';
    case 'slight-left': return 'turn_slight_left';
    case 'left': return 'turn_left';
    case 'sharp-left': return 'turn_sharp_left';
    case 'slight-right': return 'turn_slight_right';
    case 'right': return 'turn_right';
    case 'sharp-right': return 'turn_sharp_right';
    case 'arrive': return 'sports_score';
    default: return 'straight';
  }
}

export function ActiveRideStatsOverlay() {
  const liveLocation = useNavigationStore((state) => state.liveLocation);
  const isRidePaused = useNavigationStore((state) => state.isRidePaused);
  const pauseRide = useNavigationStore((state) => state.pauseRide);
  const resumeRide = useNavigationStore((state) => state.resumeRide);
  const nextInstruction = useNavigationStore((state) => state.navigationState?.nextInstruction);
  
  // Format speed (e.g., '21.5')
  const speedString = formatSpeed(liveLocation?.speedMetersPerSecond ?? 0);
  const [speedVal, unit] = speedString.split(' '); // '21.5' 'km/h'

  const bottomUIHeight = useNavigationStore((state) => state.bottomUIHeight);

  return (
    <div 
      className="pointer-events-none absolute left-0 right-0 z-20 flex w-full items-end justify-between px-5 transition-all duration-300"
      style={{ bottom: `${bottomUIHeight}px` }}
    >
      <div className="flex items-end gap-2 drop-shadow-md">
        <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'wght' 600" }}>
          {getTurnIcon(nextInstruction?.type)}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-[64px] font-extrabold italic leading-none tracking-tighter text-white drop-shadow-md">
            {speedVal}
          </span>
          <span className="text-lg font-bold italic text-white uppercase tracking-wider drop-shadow-md mb-2">
            {unit}
          </span>
        </div>
      </div>
      
      <button
        onClick={isRidePaused ? resumeRide : pauseRide}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.08] backdrop-blur-[12px] border border-white/10 shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <span className="material-symbols-outlined text-[28px] text-orange-500" style={{ fontVariationSettings: "'wght' 700" }}>
          {isRidePaused ? 'play_arrow' : 'pause'}
        </span>
      </button>
    </div>
  );
}
