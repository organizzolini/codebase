import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * Gzip level 9, file by file, matching what a browser downloads.
 *
 * Run from the corpus directory with `codometer --config ../compression/gzip.config.ts`.
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    {
      analyses: ["size"],
      compression: "gzip",
      directory: "..",
      include: ["compiled/**/*.js"],
      name: "Compiled",
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
