import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * Every input field, over files the codebase input cannot see.
 *
 * See the [targets guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  inputs: [
    // 📦 Both analyses over the compiled output. Two files.
    {
      analyses: ["language", "size"],
      compression: "gzip",
      directory: "..",
      include: ["compiled/**/*.js"],
      name: "Compiled",
    },
    // ✂️ The same globs with a `!` negation. One file.
    {
      analyses: ["size"],
      directory: "..",
      include: ["compiled/**/*.js", "!compiled/**/vendor.js"],
      name: "Compiled Without Vendor",
    },
    // 🚫 `exclude` removes as `!` does, written as its own field. Seven of the
    // fifteen TypeScript files are tests, leaving eight.
    {
      analyses: ["language"],
      exclude: ["**/*.test.ts"],
      include: ["typescript/**/*.ts"],
      name: "Sources",
    },
    // 🧭 `directory` starts the globs somewhere else, relative to the process's
    // working directory. This one reaches up out of the corpus into the
    // package.
    {
      analyses: ["size"],
      compression: "none",
      directory: "../..",
      include: ["package.json", "project.json"],
      name: "Manifests",
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
