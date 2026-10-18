import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { RunAffectedService } from "./run-affected.service";

describe(RunAffectedService, () => {
  let service: RunAffectedService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RunAffectedService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(RunAffectedService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
