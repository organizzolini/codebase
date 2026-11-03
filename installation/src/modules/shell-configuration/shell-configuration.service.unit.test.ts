import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { ShellConfigurationService } from "./shell-configuration.service";

describe(ShellConfigurationService, () => {
  const moduleOptions = { mocks: [ProcessRunnerService, ReporterService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      ShellConfigurationService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(ShellConfigurationService);
  });
});
