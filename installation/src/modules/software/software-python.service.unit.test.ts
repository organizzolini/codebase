import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { SoftwarePythonService } from "./software-python.service";

describe(SoftwarePythonService, () => {
  const moduleOptions = {
    mocks: [ProcessRunnerService, SoftwareBrewService, ReporterService],
  };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SoftwarePythonService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SoftwarePythonService);
  });
});
