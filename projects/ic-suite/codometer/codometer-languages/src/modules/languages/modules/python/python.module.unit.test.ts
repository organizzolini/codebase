import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { PythonModule } from "./python.module";
import { PythonService } from "./python.service";

describe(PythonModule, () => {
  it("exports and provides PythonService", () => {
    expectModuleExports(PythonModule, PythonService);
    expectModuleProvides(PythonModule, PythonService);
  });
});
