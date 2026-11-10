import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { PublishablePackagesGateService } from "./publishable-packages-gate.service";

describe(PublishablePackagesGateService, () => {
  const moduleOptions = { mocks: [ConfigService, ProcessRunnerService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      PublishablePackagesGateService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(PublishablePackagesGateService);
  });
});
