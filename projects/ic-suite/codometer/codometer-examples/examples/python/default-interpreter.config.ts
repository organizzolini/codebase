import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * The default interpreter: no `python` block, so `python3` on PATH is used.
 *
 * See the [python guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
};

export default codometerConfiguration;
