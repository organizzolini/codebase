import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { TomlModule } from "./toml.module";
import { TomlService } from "./toml.service";

describe(TomlModule, () => {
  it("exports and provides TomlService", () => {
    expectModuleExports(TomlModule, TomlService);
    expectModuleProvides(TomlModule, TomlService);
  });
});
