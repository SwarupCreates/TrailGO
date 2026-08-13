import { useNavigationStore } from '../app/navigationStore';
import { formatSpeed, formatDistance } from '../services/navigation/navigationService';
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
  const nextInstruction = useNavigationStore((state) => state.navigationState?.nextInstruction);
  
  // Format speed (e.g., '21.5')
  const speedString = formatSpeed(liveLocation?.speedMetersPerSecond ?? 0);
  const [speedVal, unit] = speedString.split(' '); // '21.5' 'km/h'

  return (
    <div className="pointer-events-none flex w-full items-center justify-between transition-all duration-300">
      {/* Left: Speed */}
      <div className="flex items-baseline gap-1 drop-shadow-md">
        <span className="text-[64px] font-extrabold italic leading-none tracking-tighter text-white drop-shadow-md">
          {speedVal}
        </span>
        <span className="text-lg font-bold italic text-white uppercase tracking-wider drop-shadow-md mb-2">
          {unit}
        </span>
      </div>
      
      {/* Right: Turn by Turn Navigation */}
      <div className="flex items-center gap-2 drop-shadow-md">
        {nextInstruction?.distanceToNextMeters !== undefined && (
          <span className="text-3xl font-black text-white tracking-tight drop-shadow-md">
            {formatDistance(nextInstruction.distanceToNextMeters).replace(' ', '')}
          </span>
        )}
        <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'wght' 700" }}>
          {getTurnIcon(nextInstruction?.type)}
        </span>
      </div>
    </div>
  );
}
