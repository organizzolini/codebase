import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseGroupModule } from "../release-group/release-group.module";

import { LinkPackagesCommand } from "./link-packages.command";
import { LinkPackagesModule } from "./link-packages.module";
import { LinkPackagesService } from "./link-packages.service";

describe(LinkPackagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      LinkPackagesModule,
      LoggerModule,
      ProcessRunnerModule,
      ReleaseGroupModule,
    );
    expectModuleProvides(
      LinkPackagesModule,
      LinkPackagesCommand,
      LinkPackagesService,
    );
  });
});
