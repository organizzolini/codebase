import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/logging";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { SoftwareInfraService } from "./software-infra.service";

describe(SoftwareInfraService, () => {
  let service: SoftwareInfraService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SoftwareInfraService,
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        {
          provide: SoftwareBrewService,
          useValue: createMock<SoftwareBrewService>(),
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SoftwareInfraService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
