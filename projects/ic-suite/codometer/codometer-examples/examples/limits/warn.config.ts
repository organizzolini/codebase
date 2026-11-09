import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * A limit that breaches at `severity: "warn"`: printed, with the exit code left alone.
 *
 * See the [limits guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  limits: [{ metric: "codebase.linesOfCode", severity: "warn", value: 10 }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
