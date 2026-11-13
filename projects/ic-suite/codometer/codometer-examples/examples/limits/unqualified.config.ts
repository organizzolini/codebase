import type { CodometerConfiguration } from "@codometer/configuration";

// See the [limits guide](./README.md).
/** A path with no input name binds to nothing without `defaultInput`. */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  limits: [{ metric: "linesOfCode", value: 10 }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
