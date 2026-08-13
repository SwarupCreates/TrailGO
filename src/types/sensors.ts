import type { Coordinate } from './route';

export type LiveLocation = Coordinate & {
  accuracyMeters: number;
  altitudeMeters?: number | null;
  altitudeAccuracyMeters?: number | null;
  headingDegrees?: number | null;
  speedMetersPerSecond?: number | null;
  timestamp: number;
};

export type DeviceAttitude = {
  absolute: boolean;
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  webkitCompassHeading?: number | null;
  timestamp: number;
};
