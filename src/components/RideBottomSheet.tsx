
import { useEffect, useRef } from 'react';
import type { RouteMetrics, RoutePoint } from '../types/route';
import { formatDistance } from '../services/navigation/navigationService';
import { SwipeToStartButton } from './SwipeToStartButton';
import type { WeatherData } from '../hooks/useWeather';
import { useNavigationStore } from '../app/navigationStore';

type RideBottomSheetProps = {
  metrics?: RouteMetrics;
  points?: RoutePoint[];
  routeName?: string;
  isTracking: boolean;
  onStartTracking: () => void;
  weather?: WeatherData;
};

export function RideBottomSheet({ metrics, points, routeName, isTracking, onStartTracking, weather }: RideBottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setBottomUIHeight = useNavigationStore((state) => state.setBottomUIHeight);
  const isRiding = useNavigationStore((state) => state.isRiding);
  const navigationState = useNavigationStore((state) => state.navigationState);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Add 40px for margin/padding from the bottom edge
        setBottomUIHeight(entry.contentRect.height + 40);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [setBottomUIHeight]);
  // Generate Elevation SVG path
  const pointsWithElevation = points?.filter((point) => typeof point.elevationMeters === 'number') ?? [];
  const elevations = pointsWithElevation.map((point) => point.elevationMeters as number);
  const min = elevations.length ? Math.min(...elevations) : 0;
  const max = elevations.length ? Math.max(...elevations) : 1;
  const range = Math.max(max - min, 1);
  const sampled = pointsWithElevation.filter((_, index) => index % Math.max(Math.floor(pointsWithElevation.length / 60), 1) === 0);

  const polylinePoints = sampled
    .map((point, index) => {
      const x = sampled.length <= 1 ? 0 : (index / (sampled.length - 1)) * 100;
      const y = 100 - (((point.elevationMeters ?? min) - min) / range) * 100;
      return `${x},${y}`;
    });

  // Close the polygon at the bottom for the gradient fill
  const polygon = polylinePoints.length > 0 
    ? `${polylinePoints.join(' ')} 100,100 0,100` 
    : '0,100 100,100 100,100 0,100';

  // Format display values
  const distance = formatDistance(metrics?.distanceMeters ?? 0).replace(' ', '');
  const avgGrad = metrics?.ascentMeters && metrics?.distanceMeters 
    ? ((metrics.ascentMeters / metrics.distanceMeters) * 100).toFixed(1) 
    : '0.0';
    
  const estimatedTimeSeconds = (metrics?.distanceMeters ?? 0) / 5.5; // roughly 20km/h avg speed for cycling
  const hours = Math.floor(estimatedTimeSeconds / 3600);
  const minutes = Math.floor((estimatedTimeSeconds % 3600) / 60);
  const totalDistance = metrics?.distanceMeters ?? 0;
  const remainingDistance = navigationState?.remainingDistanceMeters ?? totalDistance;
  const distanceCovered = navigationState?.offRoute 
    ? 0 
    : Math.max(0, totalDistance - remainingDistance);
  const progressPercentage = totalDistance > 0 ? (distanceCovered / totalDistance) * 100 : 0;
  
  // Create formatted strings for distance display
  const distanceStr = formatDistance(totalDistance).replace(' ', '');
  const coveredStr = formatDistance(distanceCovered).replace(' ', '');

  const displayRouteName = routeName || 'New Custom Ride';
  const truncatedName = displayRouteName.length > 24 ? displayRouteName.slice(0, 24) + '...' : displayRouteName;

  const hasElevation = pointsWithElevation.length > 1;

  return (
    <div ref={containerRef} className="absolute bottom-5 left-5 right-5 z-20">
      <div className="relative overflow-hidden rounded-[40px] bg-white/[0.08] p-4 backdrop-blur-[12px] border border-white/10 shadow-lg">
        
        {/* Header: Title and Weather */}
        <div className="flex items-start justify-between">
          <div className="flex-1 overflow-hidden pr-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white truncate">
                {truncatedName}
              </h2>
              <button className="shrink-0 text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
            </p>
          </div>
          <div className="flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-white">
              <span className="material-symbols-outlined text-[20px] text-slate-300">
                {weather?.isRaining ? 'rainy' : 'partly_cloudy_day'}
              </span>
              <span className="text-xl font-bold">{weather?.temperature ? Math.round(weather.temperature) : '--'}°C</span>
            </div>
            <p className="text-xs font-medium text-slate-400">{weather?.description || 'Loading...'}</p>
          </div>
        </div>

        {/* Main Stats */}
        {hasElevation ? (
          <div className="relative mt-4 h-24 w-full">
            {/* Elevation SVG Background */}
            <div className="absolute inset-0 z-0 opacity-80">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="elevationGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="elevationGradBg" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#475569" stopOpacity="0" />
                  </linearGradient>
                  <clipPath id="progressClip">
                    <rect x="0" y="0" width={`${progressPercentage}%`} height="100" />
                  </clipPath>
                  <clipPath id="remainingClip">
                    <rect x={`${progressPercentage}%`} y="0" width={`${100 - progressPercentage}%`} height="100" />
                  </clipPath>
                </defs>
                
                {/* Remaining (Grey) */}
                <g clipPath="url(#remainingClip)">
                  <polygon points={polygon} fill="url(#elevationGradBg)" />
                  <polyline points={polylinePoints.join(' ')} fill="none" stroke="#475569" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </g>
                
                {/* Progress (Orange) */}
                <g clipPath="url(#progressClip)">
                  <polygon points={polygon} fill="url(#elevationGrad)" />
                  <polyline points={polylinePoints.join(' ')} fill="none" stroke="#f97316" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </g>
              </svg>
            </div>
            
            {/* Stats Overlay */}
            <div className="absolute inset-0 z-10 flex items-end justify-between pb-2">
              <div>
                <p className="text-4xl font-black tracking-tighter text-white drop-shadow-md">
                  {isRiding ? `${coveredStr}` : distanceStr}
                  {isRiding && <span className="text-lg text-slate-400 font-bold ml-1">/ {distanceStr}</span>}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 drop-shadow">
                  {isRiding ? 'DISTANCE' : 'HOME ROUND TOTAL'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black tracking-tighter text-white drop-shadow-md">
                  {avgGrad}%
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 drop-shadow">
                  AVG GRAD
                </p>
              </div>
            </div>
            {/* Bottom Progress Bar / Divider */}
            {isRiding ? (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-full overflow-visible">
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-[#f97316] rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Arrow Head Thumb */}
                  <div className="absolute right-0 top-1/2 -mt-2.5 -mr-2.5 h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-x-1/2">
                    <span className="material-symbols-outlined text-[14px] text-[#f97316]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10" />
            )}
          </div>
        ) : (
          <div className="relative mt-2 w-full flex flex-col pb-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-black tracking-tighter text-white drop-shadow-md">
                  {isRiding ? `${coveredStr}` : distanceStr}
                  {isRiding && <span className="text-lg text-slate-400 font-bold ml-1">/ {distanceStr}</span>}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 drop-shadow">
                  {isRiding ? 'DISTANCE' : 'TOTAL DISTANCE'}
                </p>
              </div>
            </div>
            
            {/* Bottom Progress Bar / Divider */}
            {isRiding ? (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-full overflow-visible mt-2">
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-[#f97316] rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute right-0 top-1/2 -mt-2.5 -mr-2.5 h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-x-1/2">
                    <span className="material-symbols-outlined text-[14px] text-[#f97316]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 mt-2" />
            )}
          </div>
        )}

        {/* ETA and Terrain */}
        <div className="mt-4 flex items-center justify-between text-[15px]">
          <p className="font-medium text-slate-400">
            ETA: <span className="font-bold text-white">{hours}hr {minutes}min</span>
          </p>
          <p className="font-medium text-slate-400">Mostly Flat Roads</p>
        </div>

        {/* Swipe Button */}
        {!isRiding && (
          <SwipeToStartButton onStart={onStartTracking} isTracking={isTracking} />
        )}
      </div>
    </div>
  );
}
