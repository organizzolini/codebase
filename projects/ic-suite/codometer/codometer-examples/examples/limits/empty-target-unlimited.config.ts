import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * The same empty input with no limit. This passes.
 *
 * See the [limits guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    {
      analyses: ["size"],
      include: ["never-built/**/*.js"],
      name: "Never Built",
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
