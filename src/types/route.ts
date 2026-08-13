export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RoutePoint = Coordinate & {
  elevationMeters?: number;
  time?: string;
};

export type Waypoint = Coordinate & {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
};

export type GpxRoute = {
  id: string;
  name: string;
  points: RoutePoint[];
  waypoints: Waypoint[];
  importedAt: string;
};

export type RouteMetrics = {
  distanceMeters: number;
  ascentMeters: number;
  descentMeters: number;
  highPointMeters?: number;
  lowPointMeters?: number;
};
