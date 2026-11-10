import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * `--check reports` re-measures sizes, which differ across Node releases' zlib.
 *
 * See the [staleness guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    // Inside the measured directory on purpose, unlike the other size examples:
    // this one is run against a scratch copy of the corpus, and an input
    // reaching `..` from there would be pointed at whatever else the temporary
    // directory happens to hold.
    {
      analyses: ["size"],
      compression: "gzip",
      include: ["javascript/**/*.js"],
      name: "Scripts",
    },
  ],
  outputs: [{ indentation: 2, path: "codometer-report.json", type: "json" }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
