import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { BoundaryCheckModule } from "./boundary-check.module";
import { BoundaryCheckService } from "./boundary-check.service";
import { BoundaryFailureService } from "./boundary-failure.service";
import { BoundaryGraphService } from "./boundary-graph.service";
import { BoundaryOutcomeReportService } from "./boundary-outcome-report.service";

const SERVICES = [
  BoundaryCheckService,
  BoundaryFailureService,
  BoundaryGraphService,
  BoundaryOutcomeReportService,
];

describe(BoundaryCheckModule, () => {
  it.each(SERVICES)("exports and provides %s", (service) => {
    expectModuleExports(BoundaryCheckModule, service);
    expectModuleProvides(BoundaryCheckModule, service);
  });
});
