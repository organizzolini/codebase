import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import { expectModuleImports } from "@codebase/testing/nestjs";

import { TaskDatabaseModule } from "../task-database/task-database.module";

import { CleanupCodebaseCommand } from "./cleanup-codebase.command";
import { CleanupCodebaseModule } from "./cleanup-codebase.module";

describe(CleanupCodebaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const providers = Reflect.getMetadata(
      "providers",
      CleanupCodebaseModule,
    ) as undefined | unknown[];

    expectModuleImports(
      CleanupCodebaseModule,
      LoggerModule,
      TaskDatabaseModule,
    );

    expect(providers).toContain(CleanupCodebaseCommand);
  });
});
