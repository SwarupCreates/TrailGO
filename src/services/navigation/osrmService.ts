import type { Coordinate, GpxRoute, RoutePoint } from '../../types/route';

export async function fetchOsrmRoute(
  waypoints: Coordinate[],
  activityType: 'bike' | 'walk'
): Promise<GpxRoute> {
  const profile = activityType === 'bike' ? 'bicycle' : 'foot';
  
  if (waypoints.length < 2) {
    throw new Error('At least two waypoints are required');
  }

  // OSRM expects: longitude,latitude;longitude,latitude...
  const coordinatesStr = waypoints.map(wp => `${wp.longitude},${wp.latitude}`).join(';');
  
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coordinatesStr}?overview=full&geometries=geojson`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch route from OSRM');
  }

  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('No route found between these locations');
  }

  const geojsonCoords: [number, number][] = data.routes[0].geometry.coordinates;

  const points: RoutePoint[] = geojsonCoords.map((coord) => ({
    longitude: coord[0],
    latitude: coord[1],
  }));

  const distanceMeters = data.routes[0].distance;

  return {
    id: `osrm-${Date.now()}`,
    name: `Route (${(distanceMeters / 1000).toFixed(1)} km)`,
    points,
    waypoints: waypoints.map((wp, index) => ({
      id: `wp-${index}`,
      name: index === 0 ? 'Start' : index === waypoints.length - 1 ? 'Destination' : `Waypoint ${index}`,
      latitude: wp.latitude,
      longitude: wp.longitude,
    })),
    importedAt: new Date().toISOString(),
  };
}
