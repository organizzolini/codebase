import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { FileImportsWorkspaceGraphModule } from "./file-imports-workspace-graph.module";
import { FileImportsWorkspaceGraphService } from "./file-imports-workspace-graph.service";

describe(FileImportsWorkspaceGraphModule, () => {
  it("exports and provides FileImportsWorkspaceGraphService", () => {
    expectModuleExports(
      FileImportsWorkspaceGraphModule,
      FileImportsWorkspaceGraphService,
    );
    expectModuleProvides(
      FileImportsWorkspaceGraphModule,
      FileImportsWorkspaceGraphService,
    );
  });
});
