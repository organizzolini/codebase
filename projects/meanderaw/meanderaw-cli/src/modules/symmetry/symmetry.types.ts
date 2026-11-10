// 🏷️ Types

/**
 * How a point is reached: `0` bare, `1` anchors a southward edge, `2` an eastward one, `3` only an adjacent point's edge.
 */
export type PointRank = 0 | 1 | 2 | 3;

/** One group element, plus the shape it is acting on and which of a tile's two edge directions is being moved. */
export interface Transform extends TransformChoice {
  readonly columns: number;
  readonly isHorizontal: boolean;
  readonly rows: number;
}

/** One element of the symmetry group `SymmetryService` folds a tile by: a column shift, optionally mirrored, optionally flipped. */
export interface TransformChoice {
  readonly flip: boolean;
  readonly mirror: boolean;
  readonly shift: number;
}
