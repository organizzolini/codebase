// 🏷️ Types

/** A template point: its position and exact digit. */
export interface GlyphCell extends SubmatrixOffset {
  readonly digit: number;
}

/** A lattice point or step; `row` grows south, `column` east. */
export interface SubmatrixOffset {
  readonly column: number;
  readonly row: number;
}
