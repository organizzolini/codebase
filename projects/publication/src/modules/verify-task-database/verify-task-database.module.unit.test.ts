import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { VerifyTaskDatabaseCommand } from "./verify-task-database.command";
import { VerifyTaskDatabaseModule } from "./verify-task-database.module";

describe(VerifyTaskDatabaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", VerifyTaskDatabaseModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      VerifyTaskDatabaseModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(TaskDatabaseModule);
    expect(providers).toContain(VerifyTaskDatabaseCommand);
  });
});
