import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { PublishablePackagesGateService } from "./publishable-packages-gate.service";

describe(PublishablePackagesGateService, () => {
  let service: PublishablePackagesGateService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PublishablePackagesGateService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(PublishablePackagesGateService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
