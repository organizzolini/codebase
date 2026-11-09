import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { NestjsModulesWorkspaceGraphModule } from "./nestjs-modules-workspace-graph.module";
import { NestjsModulesWorkspaceGraphService } from "./nestjs-modules-workspace-graph.service";

describe(NestjsModulesWorkspaceGraphModule, () => {
  it("exports and provides NestjsModulesWorkspaceGraphService", () => {
    expectModuleExports(
      NestjsModulesWorkspaceGraphModule,
      NestjsModulesWorkspaceGraphService,
    );
    expectModuleProvides(
      NestjsModulesWorkspaceGraphModule,
      NestjsModulesWorkspaceGraphService,
    );
  });
});
