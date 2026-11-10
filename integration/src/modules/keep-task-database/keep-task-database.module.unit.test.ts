import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import { expectModuleImports } from "@codebase/testing/nestjs";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { KeepTaskDatabaseCommand } from "./keep-task-database.command";
import { KeepTaskDatabaseModule } from "./keep-task-database.module";

describe(KeepTaskDatabaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const providers = Reflect.getMetadata(
      "providers",
      KeepTaskDatabaseModule,
    ) as undefined | unknown[];

    expectModuleImports(
      KeepTaskDatabaseModule,
      LoggerModule,
      TaskDatabaseModule,
    );

    expect(providers).toContain(KeepTaskDatabaseCommand);
  });
});
