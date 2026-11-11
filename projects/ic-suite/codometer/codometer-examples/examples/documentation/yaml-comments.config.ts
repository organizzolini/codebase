import type { CodometerConfiguration } from "@codometer/configuration";

// See the [documentation guide](./README.md).
/** YAML comment-block budget, gated apart from JSDoc `comment` selectors. */
const codometerConfiguration: CodometerConfiguration = {
  custom: [
    {
      comment: { language: "yaml", maximumLines: 1, maximumWords: 5 },
      label: "YAML Comment Budget",
    },
  ],
  defaultInput: "codebase",
  format: "markdown",
  limits: [{ metric: "custom.YAML Comment Budget", value: 0 }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
