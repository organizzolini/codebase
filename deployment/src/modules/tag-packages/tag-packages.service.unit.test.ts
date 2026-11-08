import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseGroupService } from "../release-group/release-group.service";

import { TagPackagesService } from "./tag-packages.service";

describe(TagPackagesService, () => {
  let service: TagPackagesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TagPackagesService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: MainTipService, useValue: createMock<MainTipService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        {
          provide: ReleaseGroupService,
          useValue: createMock<ReleaseGroupService>(),
        },
      ],
    }).compile();

    service = await module.resolve(TagPackagesService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
