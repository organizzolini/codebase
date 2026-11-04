import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { CombinedOutputModule } from "./combined-output.module";
import { CombinedOutputService } from "./combined-output.service";

describe(CombinedOutputModule, () => {
  it("exports and provides CombinedOutputService", () => {
    expectModuleExports(CombinedOutputModule, CombinedOutputService);
    expectModuleProvides(CombinedOutputModule, CombinedOutputService);
  });
});
