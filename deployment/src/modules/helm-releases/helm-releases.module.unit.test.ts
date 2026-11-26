import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { HelmReleasesCommand } from "./helm-releases.command";
import { HelmReleasesModule } from "./helm-releases.module";
import { HelmReleasesService } from "./helm-releases.service";

describe(HelmReleasesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(HelmReleasesModule, LoggerModule, ProcessRunnerModule);
    expectModuleProvides(
      HelmReleasesModule,
      HelmReleasesCommand,
      HelmReleasesService,
    );
  });
});
