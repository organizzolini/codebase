import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { MergeTaskCacheCommand } from "./merge-task-cache.command";
import { MergeTaskCacheModule } from "./merge-task-cache.module";

describe(MergeTaskCacheModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", MergeTaskCacheModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", MergeTaskCacheModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(TaskDatabaseModule);
    expect(providers).toContain(MergeTaskCacheCommand);
  });
});
