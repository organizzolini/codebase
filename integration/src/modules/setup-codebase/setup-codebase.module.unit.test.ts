import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { BoundBaseToPushModule } from "../bound-base-to-push/bound-base-to-push.module";
import { ImportPrTaskCacheModule } from "../import-pr-task-cache/import-pr-task-cache.module";
import { TaskDatabaseModule } from "../task-database/task-database.module";

import { SetupCodebaseCommand } from "./setup-codebase.command";
import { SetupCodebaseModule } from "./setup-codebase.module";

describe(SetupCodebaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      SetupCodebaseModule,
      LoggerModule,
      BoundBaseToPushModule,
      ImportPrTaskCacheModule,
      TaskDatabaseModule,
    );
    expectModuleProvides(SetupCodebaseModule, SetupCodebaseCommand);
  });
});
