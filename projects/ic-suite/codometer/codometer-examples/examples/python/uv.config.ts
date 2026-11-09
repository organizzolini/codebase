import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * Python reached through a virtual environment, such as `uv run python`.
 *
 * See the [python guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  python: { command: "uv run python" },
};

export default codometerConfiguration;
