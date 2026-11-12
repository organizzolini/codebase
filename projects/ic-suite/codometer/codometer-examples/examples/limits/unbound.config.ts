import type { CodometerConfiguration } from "@codometer/configuration";

// See the [limits guide](./README.md).
/** Two paths that bind to nothing, reported together. */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    {
      analyses: ["size"],
      directory: "..",
      include: ["compiled/**/*.js"],
      name: "Compiled",
    },
  ],
  limits: [
    { metric: "nowhere.at.all", value: 1 },
    { metric: "Compiled.typescript.files", value: 1 },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
