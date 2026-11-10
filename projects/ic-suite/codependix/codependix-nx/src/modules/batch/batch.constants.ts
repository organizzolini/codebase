// ♟️ Constants

/**
 * The longest `--projects` value, in bytes, one run is given. Node 26 is
 * killed by any single argument past 1011 bytes.
 */
export const MAX_PROJECTS_ARGUMENT_BYTES = 900;

/**
 * The most command line runs a batch starts at once: four fits a 16 GB runner
 * and a 4-CPU one.
 */
export const MAX_PARALLEL_RUNS = 4;
