import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ReportingModule } from "./reporting.module";
import { ReportingService } from "./reporting.service";

describe(ReportingModule, () => {
  it("exports and provides ReportingService", () => {
    expectModuleExports(ReportingModule, ReportingService);
    expectModuleProvides(ReportingModule, ReportingService);
  });
});
