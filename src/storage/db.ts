import Dexie, { type Table } from 'dexie';
import type { GpxRoute, RouteMetrics } from '../types/route';

export type RouteRecord = {
  id: string;
  name: string;
  route: GpxRoute;
  metrics: RouteMetrics;
  createdAt: string;
};

export type MapPackageRecord = {
  id: string;
  name: string;
  format: 'pmtiles' | 'mbtiles' | 'vector-tiles' | 'geojson';
  sourceUrl: string;
  createdAt: string;
};

class OfflineNavigationDatabase extends Dexie {
  routes!: Table<RouteRecord, string>;
  mapPackages!: Table<MapPackageRecord, string>;

  constructor() {
    super('offline-gpx-navigation');
    this.version(1).stores({
      routes: 'id, name, createdAt',
      mapPackages: 'id, name, format, createdAt',
    });
  }
}

export const db = new OfflineNavigationDatabase();
