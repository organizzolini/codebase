import type { CodometerConfiguration } from "@codometer/configuration";

// Run from the corpus directory: `codometer --config ../compression/brotli.config.ts`
/** The same files at brotli quality 11, to compare against [gzip](./gzip.config.ts). */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    {
      analyses: ["size"],
      compression: "brotli",
      directory: "..",
      include: ["compiled/**/*.js"],
      name: "Compiled",
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
