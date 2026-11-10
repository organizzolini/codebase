import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareGpgService } from "./software-gpg.service";

describe(SoftwareGpgService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SoftwareGpgService, {
      mocks: [ProcessRunnerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(SoftwareGpgService);
  });
});
