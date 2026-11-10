import { describe, expect, it } from "vitest";

import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { MainTipModule } from "./main-tip.module";
import { MainTipService } from "./main-tip.service";

describe(MainTipModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(MainTipModule, ProcessRunnerModule);
    expectModuleProvides(MainTipModule, MainTipService);
  });
});
