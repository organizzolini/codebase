import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { TagPackagesService } from "../tag-packages/tag-packages.service";

import { VersionPackagesService } from "./version-packages.service";

describe(VersionPackagesService, () => {
  const moduleOptions = {
    mocks: [
      ConfigService,
      MainTipService,
      ProcessRunnerService,
      TagPackagesService,
    ],
  };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      VersionPackagesService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(VersionPackagesService);
  });
});
