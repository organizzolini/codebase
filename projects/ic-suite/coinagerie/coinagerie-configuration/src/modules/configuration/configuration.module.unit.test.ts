import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ConfigurationModule } from "./configuration.module";
import { ConfigurationService } from "./configuration.service";

describe(ConfigurationModule, () => {
  it("exports and provides ConfigurationService", () => {
    expectModuleExports(ConfigurationModule, ConfigurationService);
    expectModuleProvides(ConfigurationModule, ConfigurationService);
  });
});
