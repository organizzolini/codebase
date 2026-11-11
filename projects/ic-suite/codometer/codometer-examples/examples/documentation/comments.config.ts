import type { CodometerConfiguration } from "@codometer/configuration";

// Every limit reads `0`. See the [documentation guide](./README.md).
/** One `comment` budget per language, so limits can differ. */
const codometerConfiguration: CodometerConfiguration = {
  custom: [
    {
      comment: { language: "css", maximumWords: 3 },
      label: "CSS Comment Budget",
    },
    {
      comment: { language: "hcl", maximumWords: 3 },
      label: "HCL Comment Budget",
    },
    {
      comment: { language: "python", maximumWords: 3 },
      label: "Python Comment Budget",
    },
    // Loosened to eight words rather than held to the three every other
    // counter names. There is no shared budget to override any more, so
    // "every language at three except shell at eight" is eight independent
    // counters, and this is the one that reads differently.
    {
      comment: { language: "shell", maximumWords: 8 },
      label: "Shell Comment Budget",
    },
    {
      comment: { language: "sql", maximumWords: 3 },
      label: "SQL Comment Budget",
    },
    {
      comment: { language: "toml", maximumWords: 3 },
      label: "TOML Comment Budget",
    },
    {
      comment: { language: "typescript", maximumWords: 3 },
      label: "TypeScript Comment Budget",
    },
    {
      comment: { language: "yaml", maximumWords: 3 },
      label: "YAML Comment Budget",
    },
  ],
  defaultInput: "codebase",
  format: "markdown",
  limits: [
    { metric: "custom.CSS Comment Budget", value: 0 },
    { metric: "custom.HCL Comment Budget", value: 0 },
    { metric: "custom.Python Comment Budget", value: 0 },
    { metric: "custom.Shell Comment Budget", value: 0 },
    { metric: "custom.SQL Comment Budget", value: 0 },
    { metric: "custom.TOML Comment Budget", value: 0 },
    { metric: "custom.TypeScript Comment Budget", value: 0 },
    { metric: "custom.YAML Comment Budget", value: 0 },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
