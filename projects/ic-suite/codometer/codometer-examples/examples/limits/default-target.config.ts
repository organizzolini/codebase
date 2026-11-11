import type { CodometerConfiguration } from "@codometer/configuration";

// See the [limits guide](./README.md).
/** The `defaultInput` case: an unprefixed path reads as the default input's. */
const codometerConfiguration: CodometerConfiguration = {
  defaultInput: "codebase",
  format: "markdown",
  inputs: [
    {
      analyses: ["size"],
      include: ["typescript/**/*.ts"],
      name: "typescript",
    },
  ],
  limits: [{ label: "Interfaces", metric: "typescript.interfaces", value: 10 }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
