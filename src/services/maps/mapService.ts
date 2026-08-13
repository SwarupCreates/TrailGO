import type { StyleSpecification } from 'maplibre-gl';

export type OfflineMapPackage = {
  id: string;
  name: string;
  sourceUrl: string;
  format: 'pmtiles' | 'mbtiles' | 'vector-tiles' | 'geojson';
};

export function createEmptyOfflineStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#e2e8f0',
        },
      },
    ],
  };
}

export function createVectorTileStyle(mapPackage: OfflineMapPackage): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      offline: {
        type: 'vector',
        url: mapPackage.sourceUrl,
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#f8fafc',
        },
      },
      {
        id: 'roads',
        type: 'line',
        source: 'offline',
        'source-layer': 'transportation',
        paint: {
          'line-color': '#64748b',
          'line-width': 1.5,
        },
      },
    ],
  };
}
