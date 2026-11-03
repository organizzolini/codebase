import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { BoundBaseToPushService } from "./bound-base-to-push.service";

describe(BoundBaseToPushService, () => {
  const moduleOptions = { mocks: [ConfigService, ProcessRunnerService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      BoundBaseToPushService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(BoundBaseToPushService);
  });
});
