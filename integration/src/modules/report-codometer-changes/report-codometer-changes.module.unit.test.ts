import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { ReportCodometerChangesCommand } from "./report-codometer-changes.command";
import { ReportCodometerChangesModule } from "./report-codometer-changes.module";
import { ReportCodometerChangesService } from "./report-codometer-changes.service";

describe(ReportCodometerChangesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      ReportCodometerChangesModule,
      LoggerModule,
      ProcessRunnerModule,
    );
    expectModuleProvides(
      ReportCodometerChangesModule,
      ReportCodometerChangesCommand,
      ReportCodometerChangesService,
    );
  });
});
