import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { CollectCodometerBaselineCommand } from "./collect-codometer-baseline.command";
import { CollectCodometerBaselineModule } from "./collect-codometer-baseline.module";
import { CollectCodometerBaselineService } from "./collect-codometer-baseline.service";

describe(CollectCodometerBaselineModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(CollectCodometerBaselineModule, LoggerModule);
    expectModuleProvides(
      CollectCodometerBaselineModule,
      CollectCodometerBaselineCommand,
      CollectCodometerBaselineService,
    );
  });
});
