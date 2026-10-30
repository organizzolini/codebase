import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ChangesModule } from "./changes.module";
import { ChangesService } from "./changes.service";

describe(ChangesModule, () => {
  it("exports ChangesService", () => {
    expectModuleExports(ChangesModule, ChangesService);
  });

  it("provides ChangesService", () => {
    expectModuleProvides(ChangesModule, ChangesService);
  });
});
