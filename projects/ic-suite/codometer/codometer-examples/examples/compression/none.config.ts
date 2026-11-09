import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * The same files uncompressed: bytes on disk, the denominator for gzip and brotli.
 *
 * Run from the corpus directory with `codometer --config ../compression/none.config.ts`.
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    {
      analyses: ["size"],
      compression: "none",
      directory: "..",
      include: ["compiled/**/*.js"],
      name: "Compiled",
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
