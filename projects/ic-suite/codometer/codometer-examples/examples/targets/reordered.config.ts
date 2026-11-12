import type { CodometerConfiguration } from "@codometer/configuration";

// See the [targets guide](./README.md).
/** The same inputs with every `include` written backwards, which changes nothing. */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    {
      analyses: ["language", "size"],
      compression: "gzip",
      directory: "..",
      include: ["compiled/**/*.js"],
      name: "Compiled",
    },
    {
      analyses: ["size"],
      // The negation first, the glob that adds files second.
      directory: "..",
      include: ["!compiled/**/vendor.js", "compiled/**/*.js"],
      name: "Compiled Without Vendor",
    },
    {
      analyses: ["language"],
      exclude: ["**/*.test.ts"],
      include: ["typescript/**/*.ts"],
      name: "Sources",
    },
    {
      analyses: ["size"],
      compression: "none",
      directory: "../..",
      include: ["project.json", "package.json"],
      name: "Manifests",
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
