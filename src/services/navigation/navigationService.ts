import { bearing, distance, length, lineString, nearestPointOnLine } from '@turf/turf';
import type { Feature, Point } from 'geojson';
import type { NavigationState, TurnInstruction, TurnInstructionType } from '../../types/navigation';
import type { GpxRoute, RouteMetrics, RoutePoint, Waypoint } from '../../types/route';
import type { LiveLocation } from '../../types/sensors';

const metersPerKilometer = 1000;
const offRouteThresholdMeters = 60;
const defaultCruiseSpeedMetersPerSecond = 5.5;

type SnappedRoutePoint = Feature<
  Point,
  {
    dist?: number;
    index?: number;
    location?: number;
  }
>;

export function calculateRouteMetrics(points: RoutePoint[]): RouteMetrics {
  if (points.length < 2) {
    return {
      distanceMeters: 0,
      ascentMeters: 0,
      descentMeters: 0,
    };
  }

  const routeLine = lineString(points.map(toLngLat));
  const distanceMeters = length(routeLine, { units: 'kilometers' }) * metersPerKilometer;
  const elevations = points.map((point) => point.elevationMeters).filter((value): value is number => typeof value === 'number');

  let ascentMeters = 0;
  let descentMeters = 0;

  points.forEach((point, index) => {
    const previous = points[index - 1];
    if (!previous || typeof point.elevationMeters !== 'number' || typeof previous.elevationMeters !== 'number') {
      return;
    }

    const delta = point.elevationMeters - previous.elevationMeters;
    if (delta > 0) {
      ascentMeters += delta;
    } else {
      descentMeters += Math.abs(delta);
    }
  });

  return {
    distanceMeters,
    ascentMeters,
    descentMeters,
    highPointMeters: elevations.length ? Math.max(...elevations) : undefined,
    lowPointMeters: elevations.length ? Math.min(...elevations) : undefined,
  };
}

export function createNavigationState(route: GpxRoute, location: LiveLocation): NavigationState {
  const routeLine = lineString(route.points.map(toLngLat));
  const currentPoint = [location.longitude, location.latitude] as [number, number];
  const snapped = nearestPointOnLine(routeLine, currentPoint, { units: 'kilometers' }) as SnappedRoutePoint;
  const distanceAlongMeters = (snapped.properties.location ?? 0) * metersPerKilometer;
  const remainingDistanceMeters = Math.max(calculateRouteMetrics(route.points).distanceMeters - distanceAlongMeters, 0);
  const offRoute = (snapped.properties.dist ?? 0) * metersPerKilometer > offRouteThresholdMeters;
  const nearestRoutePoint = route.points[snapped.properties.index ?? 0];

  return {
    nextInstruction: createNextInstruction(route, snapped),
    nearestRoutePoint,
    nearestRoutePointIndex: snapped.properties.index ?? 0,
    remainingDistanceMeters,
    offRoute,
    eta: createEta(remainingDistanceMeters, location.speedMetersPerSecond ?? defaultCruiseSpeedMetersPerSecond),
    upcomingWaypoints: upcomingWaypoints(route.waypoints, currentPoint),
  };
}

export function formatDistance(meters: number) {
  if (meters >= metersPerKilometer) {
    return `${(meters / metersPerKilometer).toFixed(1)} km`;
  }

  return `${Math.round(meters)} m`;
}

export function formatSpeed(metersPerSecond: number) {
  return `${Math.max(metersPerSecond * 3.6, 0).toFixed(1)} km/h`;
}

function createNextInstruction(route: GpxRoute, snapped: SnappedRoutePoint): TurnInstruction | undefined {
  const distanceFromStartMeters = (snapped.properties.location ?? 0) * metersPerKilometer;
  const index = Math.min(snapped.properties.index ?? 0, route.points.length - 2);
  const current = route.points[index];
  const next = route.points[index + 1];
  const afterNext = route.points[index + 2];

  if (!current || !next) {
    return undefined;
  }

  if (!afterNext) {
    return {
      id: 'arrive',
      type: 'arrive',
      text: 'Destination ahead',
      point: next,
      distanceFromStartMeters,
    };
  }

  const firstBearing = bearing(toLngLat(current), toLngLat(next));
  const secondBearing = bearing(toLngLat(next), toLngLat(afterNext));
  const turnDelta = normalizeBearing(secondBearing - firstBearing);
  const type = classifyTurn(turnDelta);

  return {
    id: `instruction-${index}`,
    type,
    text: instructionText(type),
    point: next,
    distanceFromStartMeters,
  };
}

function upcomingWaypoints(waypoints: Waypoint[], currentPoint: [number, number]) {
  return waypoints
    .map((waypoint) => ({
      waypoint,
      distanceMeters: distance(currentPoint, toLngLat(waypoint), { units: 'kilometers' }) * metersPerKilometer,
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 5)
    .map(({ waypoint }) => waypoint);
}

function createEta(remainingMeters: number, speedMetersPerSecond: number) {
  if (speedMetersPerSecond <= 0) {
    return undefined;
  }

  const eta = new Date(Date.now() + (remainingMeters / speedMetersPerSecond) * 1000);
  return eta.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function classifyTurn(delta: number): TurnInstructionType {
  if (delta > 135) {
    return 'sharp-right';
  }

  if (delta > 45) {
    return 'right';
  }

  if (delta > 15) {
    return 'slight-right';
  }

  if (delta < -135) {
    return 'sharp-left';
  }

  if (delta < -45) {
    return 'left';
  }

  if (delta < -15) {
    return 'slight-left';
  }

  return 'continue';
}

function instructionText(type: TurnInstructionType) {
  const copy: Record<TurnInstructionType, string> = {
    start: 'Start route',
    continue: 'Continue ahead',
    'slight-left': 'Slight left',
    left: 'Turn left',
    'sharp-left': 'Sharp left',
    'slight-right': 'Slight right',
    right: 'Turn right',
    'sharp-right': 'Sharp right',
    arrive: 'Destination ahead',
  };

  return copy[type];
}

function normalizeBearing(delta: number) {
  return ((((delta + 180) % 360) + 360) % 360) - 180;
}

function toLngLat(point: RoutePoint | Waypoint): [number, number] {
  return [point.longitude, point.latitude];
}
