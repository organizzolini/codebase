import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../../../configuration/vitest.config.ts";

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: [
          "src/**/*.test.ts",
          "src/**/*.entity.ts",
          "src/**/*.constants.ts",
          "src/**/*.module.ts",
          "src/**/*.types.ts",
          "src/**/migrations/**/*.ts",
        ],
        include: ["src/**/*.ts"],
      },
      /**
       * Two minutes per `beforeAll`: the hook boots a Postgres container and
       * runs the migrations, which takes far longer on a CI runner than locally.
       */
      hookTimeout: 120_000,
    },
  }),
);
