import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { TaskDatabaseModule } from "../task-database/task-database.module";

import { ImportPrTaskCacheCommand } from "./import-pr-task-cache.command";
import { ImportPrTaskCacheModule } from "./import-pr-task-cache.module";
import { ImportPrTaskCacheService } from "./import-pr-task-cache.service";

describe(ImportPrTaskCacheModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", ImportPrTaskCacheModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      ImportPrTaskCacheModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(imports).toContain(TaskDatabaseModule);
    expect(providers).toContain(ImportPrTaskCacheCommand);
    expect(providers).toContain(ImportPrTaskCacheService);
  });
});
