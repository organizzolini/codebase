import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareDockerService } from "./software-docker.service";

describe(SoftwareDockerService, () => {
  const moduleOptions = { mocks: [ProcessRunnerService, ReporterService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SoftwareDockerService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SoftwareDockerService);
  });
});
