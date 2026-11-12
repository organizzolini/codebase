// ♟️ Constants

/** Orbit minima per thread batch; keeps every worker busy. */
export const DRAW_POOL_BATCH_SIZE = 1024;

// 🚨 Errors

/**
 * Thrown when a draw run worker thread could not draw a batch, naming the
 * worker's own message — the worker posts its failure back rather than
 * dying, so the draw run fails loudly instead of waiting on a reply that never
 * comes.
 */
export class DrawWorkerError extends Error {
  constructor(message: string) {
    super(`a draw run worker could not draw its batch: ${message}`);
    this.name = "DrawWorkerError";
  }
}

/**
 * Thrown when `--code` is given without both `--rows` and `--columns`.
 *
 * `--code` alone is what selects the single-drawing mode over the draw run, so
 * it cannot be `required` alongside the other two — the pair still has to be
 * checked once `--code` says which mode is meant.
 */
export class IncompleteCodeDrawingError extends Error {
  constructor() {
    super("drawing one meander by code needs both --rows and --columns");
    this.name = "IncompleteCodeDrawingError";
  }
}
