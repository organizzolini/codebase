import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { NestjsProjectModule } from "./nestjs-project.module";
import { NestjsProjectService } from "./nestjs-project.service";

describe(NestjsProjectModule, () => {
  it("exports and provides NestjsProjectService", () => {
    expectModuleExports(NestjsProjectModule, NestjsProjectService);
    expectModuleProvides(NestjsProjectModule, NestjsProjectService);
  });

  it("imports LoggerModule", () => {
    expectModuleImports(NestjsProjectModule, LoggerModule);
  });
});
