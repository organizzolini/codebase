import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";

describe(SoftwareBrewService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SoftwareBrewService, {
      mocks: [ProcessRunnerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(SoftwareBrewService);
  });
});
