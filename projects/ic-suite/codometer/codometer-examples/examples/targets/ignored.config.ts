import type { CodometerConfiguration } from "@codometer/configuration";

// See the [targets guide](./README.md).
/** An input's globs are the one place `.gitignore` does not reach. */
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
