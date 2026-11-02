import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ConfigurationModule } from "./configuration.module";
import { ConfigurationService } from "./configuration.service";
import { ProjectConfigurationService } from "./project-configuration.service";

describe(ConfigurationModule, () => {
  it("exports the facade, and provides what it is built from", () => {
    expectModuleExports(ConfigurationModule, ConfigurationService);
    expectModuleProvides(
      ConfigurationModule,
      ConfigurationService,
      ProjectConfigurationService,
    );
  });
});
