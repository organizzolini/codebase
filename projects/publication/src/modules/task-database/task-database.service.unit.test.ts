import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { TaskDatabaseService } from "./task-database.service";

describe(TaskDatabaseService, () => {
  let service: TaskDatabaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TaskDatabaseService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(TaskDatabaseService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
