import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { SoftwareOllamaService } from "./software-ollama.service";

describe(SoftwareOllamaService, () => {
  let service: SoftwareOllamaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SoftwareOllamaService,
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

    service = await module.resolve(SoftwareOllamaService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
