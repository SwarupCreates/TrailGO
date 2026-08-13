import type { RoutePoint, Waypoint } from './route';

export type TurnInstructionType =
  | 'start'
  | 'continue'
  | 'slight-left'
  | 'left'
  | 'sharp-left'
  | 'slight-right'
  | 'right'
  | 'sharp-right'
  | 'arrive';

export type TurnInstruction = {
  id: string;
  type: TurnInstructionType;
  text: string;
  point: RoutePoint;
  distanceFromStartMeters: number;
  distanceToNextMeters: number;
};

export type NavigationState = {
  nextInstruction?: TurnInstruction;
  nearestRoutePoint?: RoutePoint;
  nearestRoutePointIndex: number;
  remainingDistanceMeters: number;
  offRoute: boolean;
  eta?: string;
  upcomingWaypoints: Waypoint[];
};
