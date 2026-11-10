import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseGroupService } from "../release-group/release-group.service";

import { TagPackagesService } from "./tag-packages.service";

describe(TagPackagesService, () => {
  const moduleOptions = {
    mocks: [
      ConfigService,
      MainTipService,
      ProcessRunnerService,
      ReleaseGroupService,
    ],
  };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      TagPackagesService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(TagPackagesService);
  });
});
