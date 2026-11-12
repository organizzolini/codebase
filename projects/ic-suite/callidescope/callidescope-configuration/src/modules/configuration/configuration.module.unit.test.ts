import { MODULE_METADATA } from "@nestjs/common/constants";
import { describe, expect, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ConfigurationModule } from "./configuration.module";
import { ConfigurationService } from "./configuration.service";
import { ProjectConfigurationService } from "./project-configuration.service";

describe(ConfigurationModule, () => {
  it("exports the facade alone, and provides what it is built from", () => {
    expectModuleExports(ConfigurationModule, ConfigurationService);
    expectModuleProvides(
      ConfigurationModule,
      ConfigurationService,
      ProjectConfigurationService,
    );

    // The helper checks containment; the facade being the only export is the
    // contract, so the exact set is pinned here.
    expect(
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, ConfigurationModule),
    ).toStrictEqual([ConfigurationService]);
  });
});
