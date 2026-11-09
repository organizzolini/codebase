import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { HealthModule } from "./health.module";
import { HealthResolver } from "./health.resolver";
import { HealthService } from "./health.service";

describe(HealthModule, () => {
  it("provides its resolver and service", () => {
    expectModuleProvides(HealthModule, HealthResolver, HealthService);
  });

  it("exports its service", () => {
    expectModuleExports(HealthModule, HealthService);
  });
});
