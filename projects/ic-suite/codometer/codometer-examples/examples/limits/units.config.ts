import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * Size strings are decimal, with a required trailing `b`: `"8 KB"` is 8000 bytes.
 *
 * See the [limits guide](./README.md).
 */
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
  limits: [
    // 8000 bytes. The input compresses to more than that, so this breaches.
    { label: "Eight Kilobytes", metric: "Corpus.size", value: "8 KB" },
    // 1000000 bytes. Nothing here is close, so this holds.
    { label: "One Megabyte", metric: "Corpus.size", value: "1 MB" },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
