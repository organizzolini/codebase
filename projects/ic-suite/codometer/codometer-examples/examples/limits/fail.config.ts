import type { CodometerConfiguration } from "@codometer/configuration";

// See the [limits guide](./README.md).
/** A `fail` at 20 lines and a `warn` at 10. */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  limits: [
    {
      label: "Lines Advisory",
      metric: "codebase.linesOfCode",
      severity: "warn",
      value: 10,
    },
    { label: "Lines", metric: "codebase.linesOfCode", value: 20 },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
