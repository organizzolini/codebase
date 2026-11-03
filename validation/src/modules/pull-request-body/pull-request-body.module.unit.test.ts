import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { PullRequestBodyCommand } from "./pull-request-body.command";
import { PullRequestBodyModule } from "./pull-request-body.module";
import { PullRequestBodyService } from "./pull-request-body.service";

describe(PullRequestBodyModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(PullRequestBodyModule, LoggerModule);
    expectModuleProvides(
      PullRequestBodyModule,
      PullRequestBodyCommand,
      PullRequestBodyService,
    );
  });
});
