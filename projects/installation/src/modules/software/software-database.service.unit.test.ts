import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/logging";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareDatabaseService } from "./software-database.service";

describe(SoftwareDatabaseService, () => {
  let service: SoftwareDatabaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SoftwareDatabaseService,
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SoftwareDatabaseService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
