import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareDockerService } from "./software-docker.service";

describe(SoftwareDockerService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SoftwareDockerService, {
      mocks: [ProcessRunnerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(SoftwareDockerService);
  });
});
