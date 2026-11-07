// ♟️ Constants

/**
 * The longest `--projects` value, in bytes, one command line run is handed.
 *
 * A batch asks for many projects at once, and Node 26 is killed by the
 * operating system on any single argument past 1011 bytes, before it prints
 * anything. The workspace pins Node 24, which has no such limit, but a machine
 * on 26 would lose every batch to a kill that names no cause. The projects are
 * split across runs instead, under this figure with room to spare.
 */
export const MAX_PROJECTS_ARGUMENT_BYTES = 900;

/**
 * The most command line runs a batch starts at once.
 *
 * Each run builds the graphs of its share of the projects, and the heaviest
 * peaked near 1.3 GB, so four at a time stay well inside a 16 GB runner while
 * using the cores of a 4-CPU one. A batch in one process lost the parallelism
 * separate tasks had, and this gives it back.
 */
export const MAX_PARALLEL_RUNS = 4;
