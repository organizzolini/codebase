import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { CheckModule } from "../check/check.module";

import { BatchCommand } from "./batch.command";
import { BatchModule } from "./batch.module";

describe(BatchModule, () => {
  it("exports and provides BatchCommand", () => {
    expectModuleExports(BatchModule, BatchCommand);
    expectModuleProvides(BatchModule, BatchCommand);
    expectModuleImports(BatchModule, CheckModule, LoggerModule);
  });
});
