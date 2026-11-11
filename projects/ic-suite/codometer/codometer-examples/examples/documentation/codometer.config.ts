import type { CodometerConfiguration } from "@codometer/configuration";

// Gated with a limit of `0`. See the [documentation guide](./README.md).
/** Counts blocks over a `comment` budget, one counter per declaration kind. */
const codometerConfiguration: CodometerConfiguration = {
  custom: [
    {
      comment: { kind: "class", maximumLines: 4 },
      label: "Class Comment Budget",
    },
    {
      comment: { kind: "interface", maximumLines: 3 },
      label: "Interface Comment Budget",
    },
    {
      comment: { kind: "method", maximumLines: 2 },
      label: "Method Comment Budget",
    },
    {
      comment: { kind: "property", maximumLines: 2 },
      label: "Property Comment Budget",
    },
  ],
  defaultInput: "codebase",
  format: "markdown",
  limits: [
    { metric: "custom.Class Comment Budget", value: 0 },
    { metric: "custom.Interface Comment Budget", value: 0 },
    { metric: "custom.Method Comment Budget", value: 0 },
    { metric: "custom.Property Comment Budget", value: 0 },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
