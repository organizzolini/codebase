import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { RunContextModule } from "./run-context.module";
import { RunContextService } from "./run-context.service";

describe(RunContextModule, () => {
  it("exports and provides RunContextService", () => {
    expectModuleExports(RunContextModule, RunContextService);
    expectModuleProvides(RunContextModule, RunContextService);
  });
});
