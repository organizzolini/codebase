// ♟️ Constants

/**
 * Two point rows: the shallowest that can hold a southward edge.
 * The budget decides the deepest band, so there is no maximum here.
 */
export const DRAW_MINIMUM_ROWS = 2;

/**
 * How many edges one `mosaic` tile may hold: the only bound on the enumeration space.
 * Default for `DRAW_EDGE_BUDGET`; each edge doubles the walk.
 */
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
