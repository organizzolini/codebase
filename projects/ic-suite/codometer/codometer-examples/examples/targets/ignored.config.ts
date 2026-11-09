import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * An input's globs are the one place `.gitignore` does not reach.
 *
 * See the [targets guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    {
      analyses: ["language", "size"],
      compression: "gzip",
      include: ["generated/**/*.js"],
      name: "Ignored Output",
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
