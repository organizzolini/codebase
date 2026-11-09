// 🏷️ Types

/**
 * The four direction bits one point carries: ink leaving north, south, east,
 * or west. `0000` is a dot, `1111` a crossing.
 */
export interface Directions {
  readonly east: boolean;
  readonly north: boolean;
  readonly south: boolean;
  readonly west: boolean;
}

/**
 * A tile's edges, each held once. The tile's own degrees of freedom, and the
 * form a tile is built from.
 */
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

/**
 * One repeat tile: a `columns` by `rows` grid of points, each carrying its four
 * direction bits. `points` is indexed `[row][column]`.
 */
export interface Tile {
  readonly columns: number;
  readonly points: readonly (readonly Directions[])[];
  readonly rows: number;
}

/** Which point of a tile is being talked about, grouped into one object so a method naming it stays inside the workspace's parameter limit. */
export interface TilePoint {
  readonly column: number;
  readonly row: number;
}

/** The size of a tile, apart from anything drawn on it: how deep a band one repeat spans, and how many columns. */
export interface TileShape {
  readonly columns: number;
  readonly rows: number;
}
