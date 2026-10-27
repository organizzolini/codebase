/**
 * Every command a guide in this package tells the reader to run, and the exit
 * code the guide promises for it.
 *
 * Shared by the `examples` target's runner and by the integration suite, so a
 * run added to a guide has to be written down once and is then both smoke
 * tested and asserted. A run with no entry here fails the runner; an entry
 * with no run fails it too.
 */

/** One documented command, run in a staged copy of its example's `project/`. */
export interface ExampleRun {
  /** The `coinagerie` arguments the guide's `## Run it` section gives. */
  args: string[];
  /** The example's folder name under `examples/`. */
  example: string;
  /** The exit code the guide promises. */
  exitCode: number;
  /** Files the guide tells the reader to create first, keyed by relative path. */
  extraFiles?: Record<string, string>;
}

/** The file the `exclusions` guide tells the reader to hide behind `.gitignore`. */
export const EXCLUSIONS_SCRATCH_FILES = {
  "scratch/leftover.ts": "export const leftoverWord = 1;\n",
};

/** The check-failures configurations, each with the exit code `--check` gives it. */
export const CHECK_FAILURE_EXIT_CODES: Record<string, number> = {
  "bad-shape": 1,
  "broken-json": 1,
  duplicate: 1,
  "empty-fold": 1,
  missing: 1,
  "no-destination": 1,
  stale: 1,
  "throwing-words": 1,
  undefined: 0,
  unparsable: 1,
};

/** Every documented run, in the order the tour reads. */
export const EXAMPLE_RUNS: ExampleRun[] = [
  { args: [], example: "zero-config", exitCode: 0 },
  {
    args: [],
    example: "exclusions",
    exitCode: 0,
    extraFiles: EXCLUSIONS_SCRATCH_FILES,
  },
  { args: [], example: "folding", exitCode: 0 },
  {
    args: ["--config", "coinagerie.config.ts", "--check"],
    example: "layered-glossaries",
    exitCode: 0,
  },
  {
    args: ["--config", "packages/billing/coinagerie.config.ts", "--check"],
    example: "layered-glossaries",
    exitCode: 0,
  },
  { args: ["--check"], example: "outputs", exitCode: 0 },
  { args: ["--write"], example: "outputs", exitCode: 0 },
  { args: ["--format", "json"], example: "outputs", exitCode: 0 },
  ...Object.entries(CHECK_FAILURE_EXIT_CODES).map(
    ([name, exitCode]): ExampleRun => ({
      args: ["--config", `${name}.config.ts`, "--check"],
      example: "check-failures",
      exitCode,
    }),
  ),
  {
    args: ["--config", "missing.config.ts", "--check", "--write"],
    example: "check-failures",
    exitCode: 1,
  },
];
