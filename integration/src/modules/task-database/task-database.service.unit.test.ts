import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { TaskDatabaseService } from "./task-database.service";

describe(TaskDatabaseService, () => {
  const moduleOptions = { mocks: [ConfigService] };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      TaskDatabaseService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(TaskDatabaseService);
  });
});
