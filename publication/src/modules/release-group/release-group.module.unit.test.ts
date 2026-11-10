import { describe, expect, it } from "vitest";

import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { ReleaseGroupModule } from "./release-group.module";
import { ReleaseGroupService } from "./release-group.service";

describe(ReleaseGroupModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(ReleaseGroupModule, ProcessRunnerModule);
    expectModuleProvides(ReleaseGroupModule, ReleaseGroupService);
  });
});
