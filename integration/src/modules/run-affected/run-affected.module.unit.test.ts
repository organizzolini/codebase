import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { RunAffectedCommand } from "./run-affected.command";
import { RunAffectedModule } from "./run-affected.module";
import { RunAffectedService } from "./run-affected.service";

describe(RunAffectedModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", RunAffectedModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", RunAffectedModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(RunAffectedCommand);
    expect(providers).toContain(RunAffectedService);
  });
});
