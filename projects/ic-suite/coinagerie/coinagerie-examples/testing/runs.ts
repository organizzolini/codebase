/**
 * Every command a guide tells the reader to run, with the exit code the guide
 * promises. Shared by the runner and the tests, so each run is written once.
 * A run without an entry, or an entry without a run, fails the runner.
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

/** The `--config` every guide names; none is searched for. */
const CONFIG = ["--config", "coinagerie.config.ts"];

/** Every documented run, in the order the tour reads. */
export const EXAMPLE_RUNS: ExampleRun[] = [
  { args: CONFIG, example: "minimal-config", exitCode: 0 },
  {
    args: CONFIG,
    example: "exclusions",
    exitCode: 0,
    extraFiles: EXCLUSIONS_SCRATCH_FILES,
  },
  { args: CONFIG, example: "exclusion-patterns", exitCode: 0 },
  { args: CONFIG, example: "folding", exitCode: 0 },
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
  { args: [...CONFIG, "--check"], example: "outputs", exitCode: 0 },
  { args: [...CONFIG, "--write"], example: "outputs", exitCode: 0 },
  { args: [...CONFIG, "--format", "json"], example: "outputs", exitCode: 0 },
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
  { args: [], example: "minimal-config", exitCode: 1 },
];
