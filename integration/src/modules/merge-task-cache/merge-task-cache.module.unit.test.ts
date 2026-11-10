import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { MergeTaskCacheCommand } from "./merge-task-cache.command";
import { MergeTaskCacheModule } from "./merge-task-cache.module";

describe(MergeTaskCacheModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(MergeTaskCacheModule, LoggerModule, TaskDatabaseModule);
    expectModuleProvides(MergeTaskCacheModule, MergeTaskCacheCommand);
  });
});
