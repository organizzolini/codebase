import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import { expectModuleImports } from "@codebase/testing/nestjs";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { VerifyTaskDatabaseCommand } from "./verify-task-database.command";
import { VerifyTaskDatabaseModule } from "./verify-task-database.module";

describe(VerifyTaskDatabaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const providers = Reflect.getMetadata(
      "providers",
      VerifyTaskDatabaseModule,
    ) as undefined | unknown[];

    expectModuleImports(
      VerifyTaskDatabaseModule,
      LoggerModule,
      TaskDatabaseModule,
    );

    expect(providers).toContain(VerifyTaskDatabaseCommand);
  });
});
