import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { RunnerModule } from "./runner.module";
import { RunnerService } from "./runner.service";

describe(RunnerModule, () => {
  it("exports and provides RunnerService", () => {
    expectModuleExports(RunnerModule, RunnerService);
    expectModuleProvides(RunnerModule, RunnerService);
  });
});
