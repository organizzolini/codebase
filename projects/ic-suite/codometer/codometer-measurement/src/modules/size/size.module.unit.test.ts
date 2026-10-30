import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { SizeModule } from "./size.module";
import { SizeService } from "./size.service";

describe(SizeModule, () => {
  it("exports SizeService", () => {
    expectModuleExports(SizeModule, SizeService);
  });

  it("provides SizeService", () => {
    expectModuleProvides(SizeModule, SizeService);
  });
});
