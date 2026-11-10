import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { MainTipModule } from "../main-tip/main-tip.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { TagCodebaseCommand } from "./tag-codebase.command";
import { TagCodebaseModule } from "./tag-codebase.module";
import { TagCodebaseService } from "./tag-codebase.service";

describe(TagCodebaseModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      TagCodebaseModule,
      LoggerModule,
      MainTipModule,
      ProcessRunnerModule,
    );
    expectModuleProvides(
      TagCodebaseModule,
      TagCodebaseCommand,
      TagCodebaseService,
    );
  });
});
