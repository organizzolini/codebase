import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { BoundariesModule } from "./boundaries.module";
import { BoundariesService } from "./boundaries.service";
import { BoundaryCyclesService } from "./boundary-cycles.service";
import { BoundaryReportService } from "./boundary-report.service";
import { BoundarySelectorService } from "./boundary-selector.service";

const SERVICES = [
  BoundariesService,
  BoundaryCyclesService,
  BoundaryReportService,
  BoundarySelectorService,
];

describe(BoundariesModule, () => {
  it.each(SERVICES)("exports and provides %s", (service) => {
    expectModuleExports(BoundariesModule, service);
    expectModuleProvides(BoundariesModule, service);
  });
});
