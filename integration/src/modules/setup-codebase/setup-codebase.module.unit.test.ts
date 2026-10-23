import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { BoundBaseToPushModule } from "../bound-base-to-push/bound-base-to-push.module";
import { ImportPrTaskCacheModule } from "../import-pr-task-cache/import-pr-task-cache.module";
import { TaskDatabaseModule } from "../task-database/task-database.module";

import { SetupCodebaseCommand } from "./setup-codebase.command";
import { SetupCodebaseModule } from "./setup-codebase.module";

describe(SetupCodebaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", SetupCodebaseModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", SetupCodebaseModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(BoundBaseToPushModule);
    expect(imports).toContain(ImportPrTaskCacheModule);
    expect(imports).toContain(TaskDatabaseModule);
    expect(providers).toContain(SetupCodebaseCommand);
  });
});
