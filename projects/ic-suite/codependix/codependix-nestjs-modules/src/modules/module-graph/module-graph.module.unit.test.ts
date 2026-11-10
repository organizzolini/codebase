import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ModuleGraphModule } from "./module-graph.module";
import { ModuleGraphService } from "./module-graph.service";

describe(ModuleGraphModule, () => {
  it("exports and provides ModuleGraphService", () => {
    expectModuleExports(ModuleGraphModule, ModuleGraphService);
    expectModuleProvides(ModuleGraphModule, ModuleGraphService);
  });
});
