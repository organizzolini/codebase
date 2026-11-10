import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * A wrong interpreter exits 0 and reports Python as empty, rather than failing.
 *
 * See the [python guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  python: { command: "python-that-is-not-installed" },
};

export default codometerConfiguration;
