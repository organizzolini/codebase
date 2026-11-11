import type { CodometerConfiguration } from "@codometer/configuration";

// See the [output guide](./README.md).
/** The same splice between renamed markers, since prose can hold defaults. */
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
