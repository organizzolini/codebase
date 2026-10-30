import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { CssModule } from "./css.module";
import { CssService } from "./css.service";

describe(CssModule, () => {
  it("exports and provides CssService", () => {
    expectModuleExports(CssModule, CssService);
    expectModuleProvides(CssModule, CssService);
  });
});
