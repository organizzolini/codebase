import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareGpgService } from "./software-gpg.service";

describe(SoftwareGpgService, () => {
  const moduleOptions = { mocks: [ProcessRunnerService, ReporterService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SoftwareGpgService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SoftwareGpgService);
  });
});
