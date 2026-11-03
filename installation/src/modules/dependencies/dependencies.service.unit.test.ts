import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { DependenciesService } from "./dependencies.service";

describe(DependenciesService, () => {
  const moduleOptions = { mocks: [ProcessRunnerService, ReporterService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      DependenciesService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(DependenciesService);
  });
});
