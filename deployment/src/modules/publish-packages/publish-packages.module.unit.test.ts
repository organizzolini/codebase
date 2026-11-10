import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReleaseGroupModule } from "../release-group/release-group.module";

import { PublishPackagesCommand } from "./publish-packages.command";
import { PublishPackagesModule } from "./publish-packages.module";
import { PublishPackagesService } from "./publish-packages.service";

describe(PublishPackagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      PublishPackagesModule,
      LoggerModule,
      ProcessRunnerModule,
      ReleaseGroupModule,
    );
    expectModuleProvides(
      PublishPackagesModule,
      PublishPackagesCommand,
      PublishPackagesService,
    );
  });
});
