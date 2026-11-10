/**
 * The edge budget every whole-draw-run suite runs at, pinned below the default.
 * Overriding the environment keeps a developer's `DRAW_EDGE_BUDGET` from resizing the suites.
 */
export const DRAW_TEST_EDGE_BUDGET = 12;

/**
 * Worker threads each whole-draw-run suite draws with: none, so each draws in-process.
 * Drawing across real threads is asserted once, in `draw-pool.service.integration.test.ts`.
 */
export const DRAW_TEST_WORKERS = 0;
