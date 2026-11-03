import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { CustomizationModule } from "./customization.module";
import { CustomizationService } from "./customization.service";

describe(CustomizationModule, () => {
  it("exports and provides CustomizationService", () => {
    expectModuleExports(CustomizationModule, CustomizationService);
    expectModuleProvides(CustomizationModule, CustomizationService);
  });
});
