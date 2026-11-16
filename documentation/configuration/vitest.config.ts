import path from "node:path";

import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../configuration/typescript/vitest.config.ts";

// This project's code sits in `tooling/`, beside the documentation it maintains,
// so its tests and coverage are found from there.
export default mergeConfig(
  vitestConfig,
  defineConfig({
    root: path.join(path.dirname(import.meta.dirname), "tooling"),
  }),
);
