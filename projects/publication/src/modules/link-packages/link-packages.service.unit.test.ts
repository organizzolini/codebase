import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReleaseGroupService } from "../release-group/release-group.service";

import { LinkPackagesService } from "./link-packages.service";

describe(LinkPackagesService, () => {
  let service: LinkPackagesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LinkPackagesService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
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

    service = await module.resolve(LinkPackagesService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
