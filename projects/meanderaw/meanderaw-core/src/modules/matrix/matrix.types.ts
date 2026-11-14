// 🏷️ Types

/** A 2D lattice-point grid for a pattern, indexed `[row][column]`. */
export type Matrix = readonly (readonly MatrixPoint[])[];

/** Which of a point's four directions carry ink. */
export interface MatrixPoint {
  readonly east: boolean;
  readonly north: boolean;
  readonly south: boolean;
  readonly west: boolean;
}

/** One of the four directions a point's ink can leave it by. */
export type MatrixPointArm = keyof MatrixPoint;

/**
 * A submatrix kernel extracted from a larger Matrix during submatrix scanning operations.
 */
export interface Submatrix {
  readonly column: number;
  readonly height: number;
  readonly matrix: Matrix;
  readonly row: number;
  readonly width: number;
}
