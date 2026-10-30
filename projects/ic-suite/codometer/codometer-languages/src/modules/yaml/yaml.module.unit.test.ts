import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { YamlModule } from "./yaml.module";
import { YamlService } from "./yaml.service";

describe(YamlModule, () => {
  it("exports and provides YamlService", () => {
    expectModuleExports(YamlModule, YamlService);
    expectModuleProvides(YamlModule, YamlService);
  });
});
