import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { JupyterModule } from "./jupyter.module";
import { JupyterService } from "./jupyter.service";

describe(JupyterModule, () => {
  it("exports and provides JupyterService", () => {
    expectModuleExports(JupyterModule, JupyterService);
    expectModuleProvides(JupyterModule, JupyterService);
  });
});
