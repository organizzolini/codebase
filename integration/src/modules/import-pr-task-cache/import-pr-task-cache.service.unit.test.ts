import { ConfigService } from "@nestjs/config";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { TaskDatabaseService } from "../task-database/task-database.service";

import { ImportPrTaskCacheService } from "./import-pr-task-cache.service";

describe(ImportPrTaskCacheService, () => {
  const moduleOptions = {
    mocks: [ConfigService, ProcessRunnerService, TaskDatabaseService],
  };
  let service: ImportPrTaskCacheService;

  beforeAll(async () => {
    const { module } = await buildTestingModule(
      ImportPrTaskCacheService,
      moduleOptions,
    );

    service = await module.resolve(ImportPrTaskCacheService);
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      ImportPrTaskCacheService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(ImportPrTaskCacheService);
  });

  it("handles missing GITHUB_REPOSITORY gracefully in require", () => {
    expect.hasAssertions();

    const outcome = service.import();

    expect(outcome.lines[0]).toContain("Could not import");
  });
});
