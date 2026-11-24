import { defineConfig, mergeConfig } from "vitest/config";

import vitestConfig from "@codebase/configuration/vitest.config";

export default mergeConfig(vitestConfig, defineConfig({}));
