import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { WorkspaceGraphsModule } from "./workspace-graphs.module";
import { WorkspaceGraphsService } from "./workspace-graphs.service";

describe(WorkspaceGraphsModule, () => {
  it("exports and provides WorkspaceGraphsService", () => {
    expectModuleExports(WorkspaceGraphsModule, WorkspaceGraphsService);
    expectModuleProvides(WorkspaceGraphsModule, WorkspaceGraphsService);
  });
});
