import type { CodometerConfiguration } from "@codometer/configuration";

// See the [python guide](./README.md).
/** Python reached through a virtual environment, such as `uv run python`. */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  python: { command: "uv run python" },
};

export default codometerConfiguration;
