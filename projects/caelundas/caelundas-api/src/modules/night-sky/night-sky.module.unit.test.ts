import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { NightSkyModule } from "./night-sky.module";
import { NightSkyResolver } from "./night-sky.resolver";
import { NightSkyService } from "./night-sky.service";

describe(NightSkyModule, () => {
  it("provides its resolver and service", () => {
    expectModuleProvides(NightSkyModule, NightSkyResolver, NightSkyService);
  });

  it("exports its service", () => {
    expectModuleExports(NightSkyModule, NightSkyService);
  });
});
