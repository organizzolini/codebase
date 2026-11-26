import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { ReleaseImagesCommand } from "./release-images.command";
import { ReleaseImagesModule } from "./release-images.module";
import { ReleaseImagesService } from "./release-images.service";

describe(ReleaseImagesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(ReleaseImagesModule, LoggerModule, ProcessRunnerModule);
    expectModuleProvides(
      ReleaseImagesModule,
      ReleaseImagesCommand,
      ReleaseImagesService,
    );
  });
});
