import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import { expectModuleImports } from "@codebase/testing/nestjs";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { AdoptTaskDatabaseCommand } from "./adopt-task-database.command";
import { AdoptTaskDatabaseModule } from "./adopt-task-database.module";

describe(AdoptTaskDatabaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const providers = Reflect.getMetadata(
      "providers",
      AdoptTaskDatabaseModule,
    ) as undefined | unknown[];

    expectModuleImports(
      AdoptTaskDatabaseModule,
      LoggerModule,
      TaskDatabaseModule,
    );

    expect(providers).toContain(AdoptTaskDatabaseCommand);
  });
});
