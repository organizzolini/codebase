import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ScoringModule } from "./scoring.module";
import { ScoringService } from "./scoring.service";

describe(ScoringModule, () => {
  it("exports and provides ScoringService", () => {
    expectModuleExports(ScoringModule, ScoringService);
    expectModuleProvides(ScoringModule, ScoringService);
  });
});
