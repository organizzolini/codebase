import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { LoggerModule } from "./logger.module";
import { LoggerService } from "./logger.service";

describe(LoggerModule, () => {
  it("exports and provides LoggerService", () => {
    expectModuleExports(LoggerModule, LoggerService);
    expectModuleProvides(LoggerModule, LoggerService);
  });
});
