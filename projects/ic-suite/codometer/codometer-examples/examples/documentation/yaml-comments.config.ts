import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * YAML comment-block budget, gated on its own apart from JSDoc `comment` selectors.
 *
 * See the [documentation guide](./README.md).
 */
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
