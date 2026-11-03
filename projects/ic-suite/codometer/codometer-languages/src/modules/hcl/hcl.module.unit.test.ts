import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { HclModule } from "./hcl.module";
import { HclService } from "./hcl.service";

describe(HclModule, () => {
  it("exports and provides HclService", () => {
    expectModuleExports(HclModule, HclService);
    expectModuleProvides(HclModule, HclService);
  });
});
