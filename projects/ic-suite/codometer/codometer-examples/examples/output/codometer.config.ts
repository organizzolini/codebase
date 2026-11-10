import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * Two destinations spliced with the default markers, appended when the markers are absent.
 *
 * See the [output guide](./README.md).
 */
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
