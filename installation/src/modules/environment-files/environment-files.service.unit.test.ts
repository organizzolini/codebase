import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { EnvironmentFilesService } from "./environment-files.service";

describe(EnvironmentFilesService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(EnvironmentFilesService, {
      mocks: [ProcessRunnerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(EnvironmentFilesService);
  });
});
