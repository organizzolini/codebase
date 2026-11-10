/** One end of an edge as seen from the point it leaves: which edge, which way it heads, and where it arrives. */
export interface HalfEdge {
  readonly edge: number;
  readonly heading: Heading;
  readonly to: string;
}

/** Every point's outgoing half-edges, keyed by the point's `row,column` key. */
export type HalfEdgeGraph = ReadonlyMap<string, readonly HalfEdge[]>;

/** A compass heading, numbered clockwise from north so a right turn adds one. */
export type Heading = 0 | 1 | 2 | 3;

/**
 * One maximal run of ink through degree-two points, as the turns it makes at each point it passes.
 */
export interface Strand {
  readonly closed: boolean;
  readonly turns: readonly Turn[];
}

/**
 * The ink's heading change at one point: `1` a right (clockwise) quarter turn,
 * `-1` a left one, `0` straight on.
 */
export type Turn = -1 | 0 | 1;
