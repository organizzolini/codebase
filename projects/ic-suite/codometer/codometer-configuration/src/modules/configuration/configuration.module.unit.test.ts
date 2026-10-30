import { describe, expect, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ConfigurationLoaderService } from "./configuration-loader.service";
import { ConfigurationModule } from "./configuration.module";
import { ConfigurationService } from "./configuration.service";

describe(ConfigurationModule, () => {
  it("exports and provides ConfigurationService", () => {
    expect(() => {
      expectModuleExports(ConfigurationModule, ConfigurationService);
      expectModuleProvides(
        ConfigurationModule,
        ConfigurationService,
        ConfigurationLoaderService,
      );
    }).not.toThrow();
  });
});
