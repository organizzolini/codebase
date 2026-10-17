import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { KeepTaskDatabaseCommand } from "./keep-task-database.command";
import { KeepTaskDatabaseModule } from "./keep-task-database.module";

describe(KeepTaskDatabaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", KeepTaskDatabaseModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      KeepTaskDatabaseModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(TaskDatabaseModule);
    expect(providers).toContain(KeepTaskDatabaseCommand);
  });
});
