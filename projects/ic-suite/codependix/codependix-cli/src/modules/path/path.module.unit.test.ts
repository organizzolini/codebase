import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { PathCommand } from "./path.command";
import { PathModule } from "./path.module";

describe(PathModule, () => {
  it("exports and provides the command", () => {
    expectModuleExports(PathModule, PathCommand);
    expectModuleProvides(PathModule, PathCommand);
  });
});
