import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * Declares both destinations and one breaching limit, for the `--output-*` and `--check` matrix.
 *
 * See the [output guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  limits: [{ label: "Lines", metric: "codebase.linesOfCode", value: 20 }],
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
