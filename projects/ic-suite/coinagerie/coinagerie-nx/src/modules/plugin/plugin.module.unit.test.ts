import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { OptionsModule } from "../options/options.module";

import { PluginModule } from "./plugin.module";
import { PluginService } from "./plugin.service";

describe(PluginModule, () => {
  it("exports and provides PluginService", () => {
    expectModuleExports(PluginModule, PluginService);
    expectModuleProvides(PluginModule, PluginService);
    expectModuleImports(PluginModule, OptionsModule);
  });
});
