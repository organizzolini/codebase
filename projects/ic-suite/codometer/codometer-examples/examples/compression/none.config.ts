import type { CodometerConfiguration } from "@codometer/configuration";

// Run from the corpus directory with `codometer --config ../compression/none.config.ts`.
/** The same files uncompressed: bytes on disk, gzip and brotli's denominator. */
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
