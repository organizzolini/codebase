import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseGroupService } from "../release-group/release-group.service";

import { LinkPackagesService } from "./link-packages.service";

describe(LinkPackagesService, () => {
  const moduleOptions = {
    mocks: [ConfigService, ProcessRunnerService, ReleaseGroupService],
  };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      LinkPackagesService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(LinkPackagesService);
  });
});
