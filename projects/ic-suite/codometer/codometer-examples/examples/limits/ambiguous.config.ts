import type { CodometerConfiguration } from "@codometer/configuration";

// See the [limits guide](./README.md).
/** A path that could name two metrics, so it is refused. */
const codometerConfiguration: CodometerConfiguration = {
  defaultInput: "codebase",
  format: "markdown",
  inputs: [
    {
      analyses: ["language"],
      include: ["markdown/**/*.md"],
      name: "markdown",
    },
  ],
  limits: [{ metric: "markdown.files", value: 1 }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
