import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { AnchorsModule } from "./anchors.module";
import { AnchorsService } from "./anchors.service";

describe(AnchorsModule, () => {
  it("exports and provides AnchorsService", () => {
    expectModuleExports(AnchorsModule, AnchorsService);
    expectModuleProvides(AnchorsModule, AnchorsService);
  });
});
