import type { CodometerConfiguration } from "@codometer/configuration";

// See the [limits guide](./README.md).
/** An input matching nothing, with a limit written against it. Fails. */
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
