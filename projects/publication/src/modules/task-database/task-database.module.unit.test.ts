import { describe, expect, it } from "vitest";

import { TaskDatabaseModule } from "./task-database.module";
import { TaskDatabaseService } from "./task-database.service";

describe(TaskDatabaseModule, () => {
  it("registers and exports its service", () => {
    expect.hasAssertions();

    const providers = Reflect.getMetadata("providers", TaskDatabaseModule) as
      | undefined
      | unknown[];

    expect(providers).toContain(TaskDatabaseService);
  });
});
