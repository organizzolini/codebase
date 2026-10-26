import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { UpgradeDependenciesCommand } from "./upgrade-dependencies.command";
import { UpgradeDependenciesModule } from "./upgrade-dependencies.module";

describe(UpgradeDependenciesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata(
      "imports",
      UpgradeDependenciesModule,
    ) as undefined | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      UpgradeDependenciesModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(imports).toContain(ProcessRunnerModule);
    expect(providers).toContain(UpgradeDependenciesCommand);
  });
});
