import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { MainTipModule } from "../main-tip/main-tip.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { TagPackagesModule } from "../tag-packages/tag-packages.module";

import { VersionPackagesCommand } from "./version-packages.command";
import { VersionPackagesModule } from "./version-packages.module";
import { VersionPackagesService } from "./version-packages.service";

describe(VersionPackagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      VersionPackagesModule,
      LoggerModule,
      MainTipModule,
      ProcessRunnerModule,
      TagPackagesModule,
    );

    expectModuleProvides(
      VersionPackagesModule,
      VersionPackagesCommand,
      VersionPackagesService,
    );
  });
});
