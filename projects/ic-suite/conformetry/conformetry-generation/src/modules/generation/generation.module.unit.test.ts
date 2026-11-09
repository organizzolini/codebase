import { ConfigurationModule } from "@conformetry/configuration";
import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { GenerationModule } from "./generation.module";
import { GenerationService } from "./generation.service";

describe(GenerationModule, () => {
  it("provides and exports GenerationService", () => {
    expectModuleProvides(GenerationModule, GenerationService);
    expectModuleExports(GenerationModule, GenerationService);
  });

  it("imports the configuration layer", () => {
    expectModuleImports(GenerationModule, ConfigurationModule);
  });
});
