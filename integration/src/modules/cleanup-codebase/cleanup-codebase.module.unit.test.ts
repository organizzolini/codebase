import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { CleanupCodebaseCommand } from "./cleanup-codebase.command";
import { CleanupCodebaseModule } from "./cleanup-codebase.module";

describe(CleanupCodebaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", CleanupCodebaseModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      CleanupCodebaseModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(TaskDatabaseModule);
    expect(providers).toContain(CleanupCodebaseCommand);
  });
});
