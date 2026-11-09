import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * An input whose globs matched nothing, with a limit written against it. This fails.
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
  limits: [{ metric: "Never Built.size", value: "8 KB" }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
