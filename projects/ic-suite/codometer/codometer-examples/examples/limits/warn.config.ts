import type { CodometerConfiguration } from "@codometer/configuration";

// See the [limits guide](./README.md).
/** A limit at `severity: "warn"`: printed, exit code left alone. */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  limits: [{ metric: "codebase.linesOfCode", severity: "warn", value: 10 }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
