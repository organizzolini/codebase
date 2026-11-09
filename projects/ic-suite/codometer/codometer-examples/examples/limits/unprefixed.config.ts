import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * A path with no input name binds to nothing unless `defaultInput` is set.
 *
 * See the [limits guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  limits: [{ metric: "linesOfCode", value: 10 }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
