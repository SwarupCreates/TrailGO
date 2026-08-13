import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import { createEmptyOfflineStyle } from '../services/maps/mapService';
import type { GpxRoute } from '../types/route';
import type { LiveLocation } from '../types/sensors';

type MapViewportProps = {
  route?: GpxRoute;
  location?: LiveLocation;
};

const routeSourceId = 'active-route';
const locationSourceId = 'live-location';

export function MapViewport({ route, location }: MapViewportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createEmptyOfflineStyle(),
      center: [-97.7431, 30.2672],
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) {
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

    const updateRoute = () => {
      const source = map.getSource(routeSourceId) as GeoJSONSource | undefined;
      if (source) {
        source.setData(routeGeoJson);
      } else {
        map.addSource(routeSourceId, {
          type: 'geojson',
          data: routeGeoJson,
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

      const bounds = coordinates.reduce(
        (routeBounds, coordinate) => routeBounds.extend(coordinate as [number, number]),
        new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]),
      );
      map.fitBounds(bounds, { padding: 48, duration: 600 });
    };

    if (map.isStyleLoaded()) {
      updateRoute();
    } else {
      map.once('load', updateRoute);
    }
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !location) {
      return;
    }

    const locationGeoJson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
    } as GeoJSON.Feature;

    const updateLocation = () => {
      const source = map.getSource(locationSourceId) as GeoJSONSource | undefined;
      if (source) {
        source.setData(locationGeoJson);
      } else {
        map.addSource(locationSourceId, {
          type: 'geojson',
          data: locationGeoJson,
        });
        map.addLayer({
          id: 'live-location-dot',
          type: 'circle',
          source: locationSourceId,
          paint: {
            'circle-color': '#0ea5e9',
            'circle-radius': 8,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 3,
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      updateLocation();
    } else {
      map.once('load', updateLocation);
    }
  }, [location]);

  return <div ref={containerRef} className="h-full min-h-[420px] w-full overflow-hidden rounded border border-slate-200 bg-slate-200" />;
}
