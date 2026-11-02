import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { LockfileCommand } from "./lockfile.command";
import { LockfileModule } from "./lockfile.module";
import { LockfileService } from "./lockfile.service";

describe(LockfileModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(LockfileModule, LoggerModule);
    expectModuleProvides(LockfileModule, LockfileCommand, LockfileService);
  });
});
