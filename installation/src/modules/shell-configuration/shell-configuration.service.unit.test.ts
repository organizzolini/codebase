import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { ShellConfigurationService } from "./shell-configuration.service";

describe(ShellConfigurationService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ShellConfigurationService, {
      mocks: [ProcessRunnerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(ShellConfigurationService);
  });
});
