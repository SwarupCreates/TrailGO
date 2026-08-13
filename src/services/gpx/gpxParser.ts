import type { GpxRoute, RoutePoint, Waypoint } from '../../types/route';

export async function parseGpxFile(file: File): Promise<GpxRoute> {
  const xml = await file.text();
  return parseGpx(xml, file.name.replace(/\.gpx$/i, ''));
}

export function parseGpx(xml: string, fallbackName = 'Imported route'): GpxRoute {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const parserError = document.querySelector('parsererror');

  if (parserError) {
    throw new Error('The selected GPX file could not be parsed.');
  }

  const trackPoints = readPoints(document.querySelectorAll('trkseg trkpt'));
  const routePoints = readPoints(document.querySelectorAll('rte rtept'));
  const points = trackPoints.length ? trackPoints : routePoints;

  if (points.length < 2) {
    throw new Error('The GPX file must contain at least two track or route points.');
  }

  const name = textContent(document.querySelector('trk > name, rte > name, metadata > name')) ?? fallbackName;
  const waypoints = Array.from(document.querySelectorAll('wpt')).map(readWaypoint);

  return {
    id: crypto.randomUUID(),
    name,
    points,
    waypoints,
    importedAt: new Date().toISOString(),
  };
}

function readPoints(nodes: NodeListOf<Element>): RoutePoint[] {
  return Array.from(nodes)
    .map((node) => ({
      latitude: Number(node.getAttribute('lat')),
      longitude: Number(node.getAttribute('lon')),
      elevationMeters: numberContent(node.querySelector('ele')),
      time: textContent(node.querySelector('time')),
    }))
    .filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
}

function readWaypoint(node: Element, index: number): Waypoint {
  return {
    id: node.getAttribute('id') ?? `waypoint-${index}`,
    name: textContent(node.querySelector('name')) ?? `Waypoint ${index + 1}`,
    symbol: textContent(node.querySelector('sym')),
    description: textContent(node.querySelector('desc')),
    latitude: Number(node.getAttribute('lat')),
    longitude: Number(node.getAttribute('lon')),
  };
}

function numberContent(node: Element | null) {
  const value = textContent(node);
  return value ? Number(value) : undefined;
}

function textContent(node: Element | null) {
  return node?.textContent?.trim() || undefined;
}
