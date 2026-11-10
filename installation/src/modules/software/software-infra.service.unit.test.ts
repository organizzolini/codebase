import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { SoftwareInfraService } from "./software-infra.service";

describe(SoftwareInfraService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SoftwareInfraService, {
      mocks: [ProcessRunnerService, SoftwareBrewService, ReporterService],
    });

    expect(instance).toBeInstanceOf(SoftwareInfraService);
  });
});
