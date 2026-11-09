import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { MapCommand } from "./map.command";
import { MapModule } from "./map.module";

describe(MapModule, () => {
  it("exports and provides the command", () => {
    expectModuleExports(MapModule, MapCommand);
    expectModuleProvides(MapModule, MapCommand);
  });
});
