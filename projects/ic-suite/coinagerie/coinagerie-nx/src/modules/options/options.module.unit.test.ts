import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { OptionsModule } from "./options.module";
import { OptionsService } from "./options.service";

describe(OptionsModule, () => {
  it("exports and provides OptionsService", () => {
    expectModuleExports(OptionsModule, OptionsService);
    expectModuleProvides(OptionsModule, OptionsService);
  });
});
