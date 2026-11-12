/** One end of an edge, seen from the point it leaves. */
export interface HalfEdge {
  readonly edge: number;
  readonly heading: Heading;
  readonly to: string;
}

/** Every point's outgoing half-edges, keyed by the point's `row,column` key. */
export type HalfEdgeGraph = ReadonlyMap<string, readonly HalfEdge[]>;

/** A compass heading, clockwise from north; a right turn adds one. */
export type Heading = 0 | 1 | 2 | 3;

/** One maximal run of ink through degree-two points, with its turns. */
export interface Strand {
  readonly closed: boolean;
  readonly turns: readonly Turn[];
}

/** A point's turn: `1` right, `-1` left, `0` straight on. */
export type Turn = -1 | 0 | 1;
