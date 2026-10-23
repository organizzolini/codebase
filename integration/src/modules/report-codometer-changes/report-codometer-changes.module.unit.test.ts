import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { ReportCodometerChangesCommand } from "./report-codometer-changes.command";
import { ReportCodometerChangesModule } from "./report-codometer-changes.module";
import { ReportCodometerChangesService } from "./report-codometer-changes.service";

describe(ReportCodometerChangesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata(
      "imports",
      ReportCodometerChangesModule,
    ) as undefined | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      ReportCodometerChangesModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(ReportCodometerChangesCommand);
    expect(providers).toContain(ReportCodometerChangesService);
  });
});
