import maplibregl, { type GeoJSONSource, type Map as MapLibreMap, Marker } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { createMapStyle } from '../services/maps/mapService';
import type { GpxRoute } from '../types/route';
import type { LiveLocation } from '../types/sensors';
import { useNavigationStore } from '../app/navigationStore';

type MapViewportProps = {
  route?: GpxRoute;
  approachRoute?: GpxRoute;
  location?: LiveLocation;
  useArrowMarker?: boolean;
};

const routeSourceId = 'active-route';
const approachSourceId = 'approach-route';
const locationSourceId = 'live-location';

export function MapViewport({ route, approachRoute, location, useArrowMarker = false }: MapViewportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const locationMarkerRef = useRef<Marker | null>(null);
  const markerTypeRef = useRef<'dot' | 'arrow' | null>(null);
  const compassModeRef = useRef<'user' | 'compass'>('user');

  const compassMode = useNavigationStore((state) => state.compassMode);
  const isFollowing = useNavigationStore((state) => state.isFollowing);
  const setCompassMode = useNavigationStore((state) => state.setCompassMode);
  const setIsFollowing = useNavigationStore((state) => state.setIsFollowing);
  const setMapActions = useNavigationStore((state) => state.setMapActions);

  const bottomUIHeight = useNavigationStore((state) => state.bottomUIHeight);
  const isRiding = useNavigationStore((state) => state.isRiding);

  useEffect(() => {
    if (isRiding) {
      setCompassMode('compass');
      setIsFollowing(true);
      if (mapRef.current) {
        mapRef.current.easeTo({
          pitch: 50,
          duration: 1000
        });
      }
    }
  }, [isRiding]);

  useEffect(() => {
    compassModeRef.current = compassMode;
  }, [compassMode]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    resizeObserver.observe(containerRef.current);

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createMapStyle(isDark),
      center: [88.3639, 22.5726], // Kolkata
      zoom: 11,
      attributionControl: false,
    });

    mapRef.current = map;

    const stopFollowing = () => {
      setIsFollowing(false);
    };
    
    map.on('dragstart', stopFollowing);
    map.on('touchstart', stopFollowing);
    map.on('wheel', stopFollowing);

    const themeMatcher = window.matchMedia('(prefers-color-scheme: dark)');
    const onThemeChange = (e: MediaQueryListEvent) => {
      map.setStyle(createMapStyle(e.matches));
    };
    themeMatcher.addEventListener('change', onThemeChange);

    return () => {
      resizeObserver.disconnect();
      themeMatcher.removeEventListener('change', onThemeChange);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!route) {
      if (map.getLayer('active-route-line')) {
        map.removeLayer('active-route-line');
      }
      if (map.getSource(routeSourceId)) {
        map.removeSource(routeSourceId);
      }
      if (map.getLayer('approach-route-line')) {
        map.removeLayer('approach-route-line');
      }
      if (map.getSource(approachSourceId)) {
        map.removeSource(approachSourceId);
      }
      return;
    }

    const coordinates = route.points.map((point) => [point.longitude, point.latitude]);
    if (coordinates.length < 2) {
      return;
    }

    const routeGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      ],
    } as GeoJSON.FeatureCollection;

    const handleStyleLoad = () => {
      // Apply custom colors for dark mode (Apple Maps aesthetic)
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        try {
          const trySetPaintProperty = (layerId: string, prop: string, value: string) => {
            try {
              if (map.getLayer(layerId)) {
                map.setPaintProperty(layerId, prop, value);
              }
            } catch (e) {
              // ignore
            }
          };

          trySetPaintProperty('water', 'fill-color', '#1e2b3c'); // Navy blue
          trySetPaintProperty('waterway', 'line-color', '#1e2b3c');
          trySetPaintProperty('park_national_park', 'fill-color', '#2a3a30'); // Deep moss
          trySetPaintProperty('park_nature_reserve', 'fill-color', '#2a3a30');
          trySetPaintProperty('poi_park', 'fill-color', '#2a3a30');
          trySetPaintProperty('landcover', 'fill-color', '#15171a');
          trySetPaintProperty('background', 'background-color', '#15171a');
        } catch (e) {
          // outer catch just in case
        }
      }
      
      const source = map.getSource(routeSourceId) as GeoJSONSource | undefined;
      if (source) {
        source.setData(routeGeoJson);
      } else {
        map.addSource(routeSourceId, {
          type: 'geojson',
          data: routeGeoJson,
          lineMetrics: true,
        });
        map.addLayer({
          id: 'active-route-line',
          type: 'line',
          source: routeSourceId,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#f97316',
            'line-width': 5,
          },
        });
      }

      if (approachRoute && approachRoute.points.length > 1) {
        const approachGeoJson = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: approachRoute.points.map((p) => [p.longitude, p.latitude]),
              },
            },
          ],
        } as GeoJSON.FeatureCollection;

        const approachSource = map.getSource(approachSourceId) as GeoJSONSource | undefined;
        if (approachSource) {
          approachSource.setData(approachGeoJson);
        } else {
          map.addSource(approachSourceId, {
            type: 'geojson',
            data: approachGeoJson,
          });
          map.addLayer({
            id: 'approach-route-line',
            type: 'line',
            source: approachSourceId,
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': '#9a3412', // darker orange
              'line-width': 4,
              'line-dasharray': [2, 2],
            },
          }, 'active-route-line'); // ensure it's rendered below main route if possible
        }
      } else {
        if (map.getLayer('approach-route-line')) {
          map.removeLayer('approach-route-line');
        }
        if (map.getSource(approachSourceId)) {
          map.removeSource(approachSourceId);
        }
      }

      const bounds = coordinates.reduce(
        (routeBounds, coordinate) => routeBounds.extend(coordinate as [number, number]),
        new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]),
      );
      map.fitBounds(bounds, { padding: 48, duration: 600 });
    };

    if (map.isStyleLoaded()) {
      handleStyleLoad();
    }
    
    map.on('style.load', handleStyleLoad);

    return () => {
      map.off('style.load', handleStyleLoad);
    };
  }, [route, approachRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !location) {
      return;
    }

    const dotHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute h-10 w-10 animate-ping rounded-full bg-blue-500 opacity-30"></div>
        <div class="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
      </div>
    `;

    const arrowHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute h-10 w-10 animate-ping rounded-full bg-blue-500 opacity-20"></div>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 8px rgba(0,0,0,0.5)); transition: transform 0.2s ease-out;">
          <path d="M20 4L32 32L20 26L8 32L20 4Z" fill="#007AFF" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
        </svg>
      </div>
    `;

    const targetHtml = useArrowMarker ? arrowHtml : dotHtml;
    const currentMarkerType = useArrowMarker ? 'arrow' : 'dot';

    if (!locationMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'location-marker';
      el.innerHTML = targetHtml;
      markerTypeRef.current = currentMarkerType;
      
      locationMarkerRef.current = new Marker({ element: el, pitchAlignment: 'map', rotationAlignment: 'map' })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);

      map.flyTo({ center: [location.longitude, location.latitude], zoom: 15 });
      setIsFollowing(true);
    } else {
      locationMarkerRef.current.setLngLat([location.longitude, location.latitude]);
      
      const el = locationMarkerRef.current.getElement();
      
      if (markerTypeRef.current !== currentMarkerType) {
        el.innerHTML = targetHtml;
        markerTypeRef.current = currentMarkerType;
      }
      
      if (isFollowing && compassModeRef.current !== 'compass') {
        map.easeTo({ 
          center: [location.longitude, location.latitude],
          duration: 1000,
          easing: (t) => t
        });
      }
    }
  }, [location, useArrowMarker, isFollowing]);

  useEffect(() => {
    const unsubscribe = useNavigationStore.subscribe((state) => {
      const attitude = state.deviceAttitude;
      let heading: number | null = null;
      if (attitude?.webkitCompassHeading) {
        heading = attitude.webkitCompassHeading;
      } else if (attitude?.absolute && attitude.alpha !== null) {
        heading = 360 - attitude.alpha;
      } else {
        heading = state.liveLocation?.headingDegrees ?? null;
      }

      if (heading !== null) {
        if (locationMarkerRef.current) {
          const svg = locationMarkerRef.current.getElement().querySelector('svg');
          if (svg) svg.style.transform = `rotate(${heading}deg)`;
        }

        if (compassModeRef.current === 'compass' && heading !== null && mapRef.current) {
          mapRef.current.easeTo({
            bearing: heading,
            duration: 200,
            easing: (t) => t
          });
        }
      }

      // Update route gradient based on progress
      if (state.isRiding && state.navigationState && state.routeMetrics?.distanceMeters && mapRef.current) {
        const total = state.routeMetrics.distanceMeters;
        const remaining = state.navigationState.remainingDistanceMeters;
        const covered = Math.max(0, total - remaining);
        const progress = Math.min(Math.max(total > 0 ? covered / total : 0, 0), 1);
        
        if (mapRef.current.getLayer('active-route-line')) {
          let stops: any[] = [];
          if (progress <= 0.001) {
            stops = [0, '#f97316', 1, '#f97316'];
          } else if (progress >= 0.999) {
            stops = [0, '#9a3412', 1, '#9a3412'];
          } else {
            stops = [
              0, '#9a3412',
              progress, '#9a3412',
              progress + 0.0001, '#f97316',
              1, '#f97316'
            ];
          }

          mapRef.current.setPaintProperty('active-route-line', 'line-gradient', [
            'interpolate',
            ['linear'],
            ['line-progress'],
            ...stops
          ]);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setMapActions({
      recenter: () => {
        if (location && mapRef.current) {
          mapRef.current.easeTo({
            center: [location.longitude, location.latitude],
            zoom: 15,
            pitch: compassMode === 'compass' ? 50 : 0,
            duration: 1000
          });
          setIsFollowing(true);
        }
      },
      toggleCompass: () => {
        const newMode = compassMode === 'compass' ? 'user' : 'compass';
        setCompassMode(newMode);
        if (mapRef.current) {
          mapRef.current.easeTo({
            pitch: newMode === 'compass' ? 50 : 0,
            bearing: newMode === 'compass' ? mapRef.current.getBearing() : 0,
            duration: 1000
          });
        }
      }
    });
    return () => setMapActions(null);
  }, [location, compassMode, setMapActions, setCompassMode, setIsFollowing]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
