import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { SoftwarePythonService } from "./software-python.service";

describe(SoftwarePythonService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SoftwarePythonService, {
      mocks: [ProcessRunnerService, SoftwareBrewService, ReporterService],
    });

    expect(instance).toBeInstanceOf(SoftwarePythonService);
  });
});
