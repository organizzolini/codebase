import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { PythonImportsModule } from "./python-imports.module";
import { PythonImportsService } from "./python-imports.service";

describe(PythonImportsModule, () => {
  it("exports and provides PythonImportsService", () => {
    expectModuleExports(PythonImportsModule, PythonImportsService);
    expectModuleProvides(PythonImportsModule, PythonImportsService);
  });
});
