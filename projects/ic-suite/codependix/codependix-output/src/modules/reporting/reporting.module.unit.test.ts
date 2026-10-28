import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ReportingModule } from "./reporting.module";
import { ReportingService } from "./reporting.service";

describe(ReportingModule, () => {
  it("exports and provides ReportingService", () => {
    expectModuleExports(ReportingModule, ReportingService);
    expectModuleProvides(ReportingModule, ReportingService);
  });

  // Each published package bundles its own copy of `@codebase/observability`, so
  // the global `LoggerModule` a host imports provides a different
  // `LoggerService` class than the one `ReportingService` injects.
  it("imports the LoggerModule its own LoggerService comes from", () => {
    expectModuleImports(ReportingModule, LoggerModule);
  });
});
