import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * The named configuration answers alone; nothing is merged from parent files.
 *
 * See the [discovery guide](../README.md).
 */
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
