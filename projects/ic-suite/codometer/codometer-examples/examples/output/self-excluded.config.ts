import type { CodometerConfiguration } from "@codometer/configuration";

// See the [output guide](./README.md).
/** Codometer skips the files it writes, so repeated runs stay stable. */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  outputs: [
    { indentation: 2, path: "codometer-report.json", type: "json" },
    {
      description: "Measured from the sample corpus.",
      path: "statistics.md",
      type: "markdown",
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
