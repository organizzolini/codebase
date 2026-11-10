import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { RunAffectedService } from "./run-affected.service";

describe(RunAffectedService, () => {
  const moduleOptions = { mocks: [ConfigService, ProcessRunnerService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      RunAffectedService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(RunAffectedService);
  });
});
