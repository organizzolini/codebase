import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "../{{workspaceRelativePrefix}}configuration/typescript/vitest.config.ts";

export default mergeConfig(vitestConfig, defineConfig({}));
