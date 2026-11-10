import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { RunAffectedCommand } from "./run-affected.command";
import { RunAffectedModule } from "./run-affected.module";
import { RunAffectedService } from "./run-affected.service";

describe(RunAffectedModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(RunAffectedModule, LoggerModule, ProcessRunnerModule);
    expectModuleProvides(
      RunAffectedModule,
      RunAffectedCommand,
      RunAffectedService,
    );
  });
});
