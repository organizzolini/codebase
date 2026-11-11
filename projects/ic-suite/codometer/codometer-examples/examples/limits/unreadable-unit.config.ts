import type { CodometerConfiguration } from "@codometer/configuration";

// See the [limits guide](./README.md).
/** A value nothing can read, such as `8 K`, is refused. */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    {
      analyses: ["size"],
      compression: "gzip",
      include: ["**/*"],
      name: "Corpus",
    },
  ],
  limits: [{ metric: "Corpus.size", value: "8 K" }],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
