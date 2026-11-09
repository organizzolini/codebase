import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { DifferencesModule } from "./differences.module";
import { DifferencesService } from "./differences.service";

describe(DifferencesModule, () => {
  it("exports and provides DifferencesService", () => {
    expectModuleExports(DifferencesModule, DifferencesService);
    expectModuleProvides(DifferencesModule, DifferencesService);
  });
});
