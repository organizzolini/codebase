// 🏷️ Types

/** Point reach: `0` bare, `1` south, `2` east, `3` neighbor's. */
export type PointRank = 0 | 1 | 2 | 3;

/** A group element, its shape, and an edge direction. */
export interface Transform extends TransformChoice {
  readonly columns: number;
  readonly isHorizontal: boolean;
  readonly rows: number;
}

/** A symmetry: a column shift, optionally mirrored and flipped. */
export interface TransformChoice {
  readonly flip: boolean;
  readonly mirror: boolean;
  readonly shift: number;
}
