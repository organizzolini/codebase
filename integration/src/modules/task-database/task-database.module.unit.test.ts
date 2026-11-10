import { describe, expect, it } from "vitest";

import { expectModuleProvides } from "@codebase/testing/nestjs";

import { TaskDatabaseModule } from "./task-database.module";
import { TaskDatabaseService } from "./task-database.service";

describe(TaskDatabaseModule, () => {
  it("registers and exports its service", () => {
    expect.hasAssertions();

    expectModuleProvides(TaskDatabaseModule, TaskDatabaseService);
  });
});
