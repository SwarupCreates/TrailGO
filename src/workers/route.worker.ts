import type { RoutePoint } from '../types/route';

type RouteWorkerRequest = {
  type: 'route-summary';
  points: RoutePoint[];
};

self.onmessage = (event: MessageEvent<RouteWorkerRequest>) => {
  if (event.data.type !== 'route-summary') {
    return;
  }

  self.postMessage({
    pointCount: event.data.points.length,
    hasElevation: event.data.points.some((point) => typeof point.elevationMeters === 'number'),
  });
};

export {};
