import type { CodometerConfiguration } from "@codometer/configuration";

// See the [python guide](./README.md).
/** A wrong interpreter exits 0 and reports Python as empty. */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  python: { command: "python-that-is-not-installed" },
};

export default codometerConfiguration;
