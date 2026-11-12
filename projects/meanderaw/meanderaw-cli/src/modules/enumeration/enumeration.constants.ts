// ♟️ Constants

/** Two point rows: the shallowest holding a southward edge. */
export const DRAW_MINIMUM_ROWS = 2;

/** Edges a `mosaic` tile may hold; each doubles the walk. */
export const EDGE_BUDGET = 24;

/**
 * Thrown when a tile shape holds more edges than the configured budget admits.
 *
 * Enumeration walks `2 ** edges` assignments, so a shape past the budget would
 * not finish rather than run slowly.
 */
export class OversizedTileError extends Error {
  constructor(
    shape: { columns: number; rows: number },
    edges: number,
    budget: number,
  ) {
    super(
      `a ${shape.rows}-row tile of ${shape.columns} columns holds ${edges} edges, past the budget of ${budget}`,
    );
    this.name = "OversizedTileError";
  }
}
