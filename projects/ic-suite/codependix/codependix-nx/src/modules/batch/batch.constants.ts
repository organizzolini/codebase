// ♟️ Constants

/** Longest `--projects` value; Node 26 dies past 1011 bytes. */
export const MAX_PROJECTS_ARGUMENT_BYTES = 900;

/** Concurrent command-line runs; four suits a 16 GB, 4-CPU runner. */
export const MAX_PARALLEL_RUNS = 4;
