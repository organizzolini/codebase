import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { MainTipModule } from "../main-tip/main-tip.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseGroupModule } from "../release-group/release-group.module";

import { TagPackagesCommand } from "./tag-packages.command";
import { TagPackagesModule } from "./tag-packages.module";
import { TagPackagesService } from "./tag-packages.service";

describe(TagPackagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      TagPackagesModule,
      LoggerModule,
      MainTipModule,
      ProcessRunnerModule,
      ReleaseGroupModule,
    );
    expectModuleProvides(
      TagPackagesModule,
      TagPackagesCommand,
      TagPackagesService,
    );
  });
});
