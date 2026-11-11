// 🏷️ Types

/** Point direction bits: `0000` a dot, `1111` a crossing. */
export interface Directions {
  readonly east: boolean;
  readonly north: boolean;
  readonly south: boolean;
  readonly west: boolean;
}

/** A tile's degrees of freedom, each edge held once. */
export interface Edges {
  readonly horizontal: readonly (readonly boolean[])[];
  readonly vertical: readonly (readonly boolean[])[];
}

/**
 * A tile's edges while being filled in, before `TileService.build` freezes them.
 */
export interface EdgesDraft {
  readonly horizontal: boolean[][];
  readonly vertical: boolean[][];
}

/** A `columns` by `rows` grid of points, indexed `[row][column]`. */
export interface Tile {
  readonly columns: number;
  readonly points: readonly (readonly Directions[])[];
  readonly rows: number;
}

/** A tile point, bundled to respect the parameter limit. */
export interface TilePoint {
  readonly column: number;
  readonly row: number;
}

/** A tile's band depth and column count. */
export interface TileShape {
  readonly columns: number;
  readonly rows: number;
}
