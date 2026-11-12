import type { CodometerConfiguration } from "@codometer/configuration";

// See the [discovery guide](../README.md).
/** The named configuration answers alone; nothing is merged from parent files. */
const codometerConfiguration: CodometerConfiguration = {
  custom: [
    {
      color: "9333ea",
      label: "Configurations",
      patterns: ["**/*.config.ts"],
    },
  ],
  format: "markdown",
};

export default codometerConfiguration;
