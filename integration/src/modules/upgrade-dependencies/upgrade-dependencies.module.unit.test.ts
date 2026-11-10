import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { UpgradeDependenciesCommand } from "./upgrade-dependencies.command";
import { UpgradeDependenciesModule } from "./upgrade-dependencies.module";

describe(UpgradeDependenciesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      UpgradeDependenciesModule,
      LoggerModule,
      ProcessRunnerModule,
    );
    expectModuleProvides(UpgradeDependenciesModule, UpgradeDependenciesCommand);
  });
});
