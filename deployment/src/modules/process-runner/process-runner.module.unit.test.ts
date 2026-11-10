import { describe, expect, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "./process-runner.module";
import { ProcessRunnerService } from "./process-runner.service";

describe(ProcessRunnerModule, () => {
  it("provides and exports the process runner", () => {
    expect.hasAssertions();

    expectModuleProvides(ProcessRunnerModule, ProcessRunnerService);
    expectModuleExports(ProcessRunnerModule, ProcessRunnerService);
  });
});
