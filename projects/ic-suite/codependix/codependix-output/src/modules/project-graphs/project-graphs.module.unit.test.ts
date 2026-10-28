import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { ProjectGraphsModule } from "./project-graphs.module";
import { ProjectGraphsService } from "./project-graphs.service";

describe(ProjectGraphsModule, () => {
  it("exports and provides ProjectGraphsService", () => {
    expectModuleExports(ProjectGraphsModule, ProjectGraphsService);
    expectModuleProvides(ProjectGraphsModule, ProjectGraphsService);
  });
});
