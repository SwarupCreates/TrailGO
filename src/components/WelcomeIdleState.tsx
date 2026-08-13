import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGpxImport } from '../hooks/useGpxImport';
import type { WeatherData } from '../hooks/useWeather';
import { useNavigationStore } from '../app/navigationStore';
import { fetchOsrmRoute } from '../services/navigation/osrmService';
import { calculateRouteMetrics } from '../services/navigation/navigationService';
import { useAuthStore } from '../app/authStore';

type WelcomeIdleStateProps = {
  weather?: WeatherData;
};

export function WelcomeIdleState({ weather }: WelcomeIdleStateProps) {
  const inputId = useId();
  const [error, setError] = useState<string>();
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { importFile } = useGpxImport();
  
  const liveLocation = useNavigationStore((state) => state.liveLocation);
  const activityType = useNavigationStore((state) => state.activityType);
  const setActiveRoute = useNavigationStore((state) => state.setActiveRoute);
  
  const user = useAuthStore((state) => state.user);

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');

  const parseCoordinates = async (input: string): Promise<{ lat: number; lng: number }[] | null> => {
    let textToParse = input;

    // Resolve Google Maps short links
    if (input.includes('maps.app.goo.gl') || input.includes('goo.gl/maps')) {
      try {
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(input)}`);
        const data = await res.json();
        if (data.contents) {
          const dirMatch = data.contents.match(/(https:\/\/(www\.)?google\.com\/maps\/dir\/[^"'\s]+)/);
          if (dirMatch) {
            textToParse = decodeURIComponent(dirMatch[1].replace(/&amp;/g, '&'));
          } else if (data.status?.url) {
            textToParse = decodeURIComponent(data.status.url);
          }
        }
      } catch (e) {
        console.error('Failed to resolve short URL', e);
      }
    }

    // Match Google Maps /dir/ URL for multiple waypoints
    const dirMatch = textToParse.match(/\/dir\/([^@?]+)/);
    if (dirMatch) {
      const dataBlock = textToParse.match(/data=([^?]+)/);
      const dataPairs: {lat: number, lng: number}[] = [];
      if (dataBlock) {
        const placeMatches = [...dataBlock[1].matchAll(/!1d(-?\d+\.\d+)!2d(-?\d+\.\d+)/g)];
        for (const m of placeMatches) {
          dataPairs.push({ lng: parseFloat(m[1]), lat: parseFloat(m[2]) });
        }
      }

      const parts = dirMatch[1].split('/').filter(Boolean);
      const waypoints: {lat: number, lng: number}[] = [];
      let dataIndex = 0;
      for (const part of parts) {
        const coordMatch = part.match(/^(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          waypoints.push({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) });
        } else {
          if (dataIndex < dataPairs.length) {
            waypoints.push(dataPairs[dataIndex]);
            dataIndex++;
          }
        }
      }
      if (waypoints.length > 0) return waypoints;
    }

    // First check for destination pin coordinates in data block (!3d... !4d...)
    const pinRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const pinMatch = textToParse.match(pinRegex);
    if (pinMatch) {
      return [{ lat: parseFloat(pinMatch[1]), lng: parseFloat(pinMatch[2]) }];
    }

    // Match Google Maps @lat,lng (fallback to viewport center)
    const gmapsRegex = /@(-?\d+\.\d+)\s*,\s*\+?(-?\d+\.\d+)/;
    const gmapsMatch = textToParse.match(gmapsRegex);
    if (gmapsMatch) {
      return [{ lat: parseFloat(gmapsMatch[1]), lng: parseFloat(gmapsMatch[2]) }];
    }

    // Match N/E format: 23.526555°N 88.799042°E
    const neRegex = /(-?\d+\.\d+)°?([NSns])\s*(-?\d+\.\d+)°?([EWew])/;
    const neMatch = textToParse.match(neRegex);
    if (neMatch) {
      let lat = parseFloat(neMatch[1]);
      let lng = parseFloat(neMatch[3]);
      if (neMatch[2].toUpperCase() === 'S') lat = -lat;
      if (neMatch[4].toUpperCase() === 'W') lng = -lng;
      return [{ lat, lng }];
    }

    // Basic match for "lat, lng" or "lat, +lng"
    const coordRegex = /(-?\d+\.\d+)\s*,\s*\+?(-?\d+\.\d+)/;
    const match = textToParse.match(coordRegex);
    if (match) {
      return [{ lat: parseFloat(match[1]), lng: parseFloat(match[2]) }];
    }
    
    return null;
  };

  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault();
      setError(undefined);
      setIsSearching(true);
      
      const targetCoords = await parseCoordinates(searchValue);
      
      if (!targetCoords || targetCoords.length === 0) {
        setError("Could not parse coordinates. Try 'lat, lng' format.");
        setIsSearching(false);
        return;
      }
      
      if (!liveLocation) {
        setError("Waiting for GPS location to calculate route.");
        setIsSearching(false);
        return;
      }

      try {
        // If the first waypoint is very close to our current location, we don't need to prepend liveLocation.
        // For simplicity, we just prepend liveLocation so it always routes from where we are.
        const waypoints = [
          { latitude: liveLocation.latitude, longitude: liveLocation.longitude },
          ...targetCoords.map(c => ({ latitude: c.lat, longitude: c.lng }))
        ];

        const route = await fetchOsrmRoute(waypoints, activityType || 'bike');
        const metrics = calculateRouteMetrics(route.points);
        setActiveRoute(route, metrics);
        setSearchValue('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate route.');
      } finally {
        setIsSearching(false);
      }
    }
  };

  const loginWithGithubMock = useAuthStore((state) => state.loginWithGithubMock);
  const logout = useAuthStore((state) => state.logout);
  const containerRef = useRef<HTMLDivElement>(null);
  const setBottomUIHeight = useNavigationStore((state) => state.setBottomUIHeight);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // WelcomeIdleState is positioned at bottom-[140px], so total height is its height + 140px
        setBottomUIHeight(entry.contentRect.height + 140);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [setBottomUIHeight]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute bottom-[140px] left-0 right-0 z-20 flex flex-col px-5">
      <div className="h-6 shrink-0 w-full" />
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Header */}
      <div className="mb-4 flex items-end justify-between pointer-events-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] leading-tight font-bold text-white drop-shadow-md">
            Welcome to TrailGo
          </h1>
          <p className="text-[13px] font-semibold text-[#a1a1aa] drop-shadow-md">{formattedDate}</p>
        </div>
        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-1.5 text-white drop-shadow-md">
            {weather ? (
              <>
                <span className="material-symbols-outlined text-[20px] text-slate-200">
                  {weather?.isRaining ? 'rainy' : 'partly_cloudy_day'}
                </span>
                <span className="text-[22px] font-bold tracking-tight">
                  {weather?.temperature ? Math.round(weather.temperature) : '--'}°C
                </span>
              </>
            ) : (
              <span className="material-symbols-outlined text-[24px]">partly_cloudy_day</span>
            )}
          </div>
          <p className="text-[13px] font-semibold text-[#a1a1aa] drop-shadow-md">
            {weather ? weather.description : 'Loading weather...'}
          </p>
        </div>
      </div>

      {/* Search Bar & GPX Upload Row */}
      <div className="pointer-events-auto flex w-full gap-3">
        {/* Search Input */}
        <div className="relative flex h-[52px] flex-1 items-center gap-3 rounded-[26px] bg-white/[0.08] backdrop-blur-[12px] px-5 shadow-lg border border-white/10 overflow-hidden">
          {isSearching ? (
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
               className="h-5 w-5 shrink-0 rounded-full border-2 border-white/20 border-t-[#ff6b00]"
             />
          ) : (
            <span className="material-symbols-outlined shrink-0 text-[20px] text-[#ff6b00]">my_location</span>
          )}
          <input
            type="text"
            placeholder="Search Destination"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchSubmit}
            disabled={isSearching}
            className="w-full bg-transparent text-[15px] font-semibold text-white placeholder-[#a1a1aa] outline-none disabled:opacity-50"
          />
        </div>

        {/* GPX Upload Button */}
        <div className="relative">
          <label
            htmlFor={inputId}
            className="flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[26px] bg-[#ff6b00] px-6 font-bold text-white shadow-2xl transition hover:bg-[#e66000] active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">map</span>
            <span className="text-[15px]">GPX</span>
          </label>
          <input
            id={inputId}
            type="file"
            accept=".gpx,application/gpx+xml,application/xml,text/xml"
            className="sr-only"
            onChange={async (event) => {
              const target = event.currentTarget;
              const file = target.files?.[0];
              setError(undefined);
              if (!file) return;

              try {
                await importFile(file);
              } catch (importError) {
                setError(importError instanceof Error ? importError.message : 'Unable to import GPX.');
              } finally {
                target.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
