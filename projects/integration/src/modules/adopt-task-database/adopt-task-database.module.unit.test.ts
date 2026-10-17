import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { AdoptTaskDatabaseCommand } from "./adopt-task-database.command";
import { AdoptTaskDatabaseModule } from "./adopt-task-database.module";

describe(AdoptTaskDatabaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", AdoptTaskDatabaseModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      AdoptTaskDatabaseModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(TaskDatabaseModule);
    expect(providers).toContain(AdoptTaskDatabaseCommand);
  });
});
