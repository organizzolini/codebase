import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * The same splice between markers of another name, since prose can hold the default ones.
 *
 * See the [output guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  outputs: [
    {
      description: "Measured from the sample corpus.",
      endMarker: "<!-- SAMPLE_STATISTICS_END -->",
      path: "statistics.md",
      startMarker: "<!-- SAMPLE_STATISTICS_START -->",
      type: "markdown",
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
