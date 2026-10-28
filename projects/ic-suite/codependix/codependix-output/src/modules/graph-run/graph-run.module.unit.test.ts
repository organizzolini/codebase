import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { GraphRunModule } from "./graph-run.module";
import { GraphRunService } from "./graph-run.service";

describe(GraphRunModule, () => {
  it("exports and provides GraphRunService", () => {
    expectModuleExports(GraphRunModule, GraphRunService);
    expectModuleProvides(GraphRunModule, GraphRunService);
  });

  // Each published package bundles its own copy of `@codebase/observability`, so
  // the global `LoggerModule` a host imports provides a different
  // `LoggerService` class than the one `GraphRunService` injects.
  it("imports the LoggerModule its own LoggerService comes from", () => {
    expectModuleImports(GraphRunModule, LoggerModule);
  });
});
