import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { DependenciesService } from "./dependencies.service";

describe(DependenciesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(DependenciesService, {
      mocks: [ProcessRunnerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(DependenciesService);
  });
});
