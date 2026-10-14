import { describe, expect, it } from "vitest";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { TaskDatabaseModule } from "./task-database.module";
import { TaskDatabaseService } from "./task-database.service";

describe(TaskDatabaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", TaskDatabaseModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata("providers", TaskDatabaseModule) as
      | undefined
      | unknown[];

    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(TaskDatabaseService);
  });
});
