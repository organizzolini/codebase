import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { TaskDatabaseService } from "../task-database/task-database.service";

import { ImportPrTaskCacheService } from "./import-pr-task-cache.service";

describe(ImportPrTaskCacheService, () => {
  let service: ImportPrTaskCacheService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ImportPrTaskCacheService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        {
          provide: TaskDatabaseService,
          useValue: createMock<TaskDatabaseService>(),
        },
      ],
    }).compile();

    service = await module.resolve(ImportPrTaskCacheService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });
});
