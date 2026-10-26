import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { BoundBaseToPushService } from "./bound-base-to-push.service";

describe(BoundBaseToPushService, () => {
  let service: BoundBaseToPushService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BoundBaseToPushService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(BoundBaseToPushService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
