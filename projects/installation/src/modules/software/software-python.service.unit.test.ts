import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/logging";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { SoftwarePythonService } from "./software-python.service";

describe(SoftwarePythonService, () => {
  let service: SoftwarePythonService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SoftwarePythonService,
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

    service = await module.resolve(SoftwarePythonService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
