import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseGroupService } from "../release-group/release-group.service";

import { PublishPackagesService } from "./publish-packages.service";

describe(PublishPackagesService, () => {
  const moduleOptions = {
    mocks: [ConfigService, ProcessRunnerService, ReleaseGroupService],
  };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      PublishPackagesService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(PublishPackagesService);
  });
});
