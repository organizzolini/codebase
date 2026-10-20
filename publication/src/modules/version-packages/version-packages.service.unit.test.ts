import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { TagPackagesService } from "../tag-packages/tag-packages.service";

import { VersionPackagesService } from "./version-packages.service";

describe(VersionPackagesService, () => {
  let service: VersionPackagesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VersionPackagesService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: MainTipService, useValue: createMock<MainTipService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        {
          provide: TagPackagesService,
          useValue: createMock<TagPackagesService>(),
        },
      ],
    }).compile();

    service = await module.resolve(VersionPackagesService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
