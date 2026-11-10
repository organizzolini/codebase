import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { PublishablePackagesGateCommand } from "./publishable-packages-gate.command";
import { PublishablePackagesGateModule } from "./publishable-packages-gate.module";
import { PublishablePackagesGateService } from "./publishable-packages-gate.service";

describe(PublishablePackagesGateModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      PublishablePackagesGateModule,
      LoggerModule,
      ProcessRunnerModule,
    );
    expectModuleProvides(
      PublishablePackagesGateModule,
      PublishablePackagesGateCommand,
      PublishablePackagesGateService,
    );
  });
});
