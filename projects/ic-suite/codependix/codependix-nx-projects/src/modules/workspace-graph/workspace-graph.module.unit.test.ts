import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { WorkspaceGraphModule } from "./workspace-graph.module";
import { WorkspaceGraphService } from "./workspace-graph.service";

describe(WorkspaceGraphModule, () => {
  it("exports and provides WorkspaceGraphService", () => {
    expectModuleExports(WorkspaceGraphModule, WorkspaceGraphService);
    expectModuleProvides(WorkspaceGraphModule, WorkspaceGraphService);
  });
});
