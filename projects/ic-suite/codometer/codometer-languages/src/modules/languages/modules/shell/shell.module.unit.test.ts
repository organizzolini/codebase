import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ShellModule } from "./shell.module";
import { ShellService } from "./shell.service";

describe(ShellModule, () => {
  it("exports and provides ShellService", () => {
    expectModuleExports(ShellModule, ShellService);
    expectModuleProvides(ShellModule, ShellService);
  });
});
