import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { SynchronizationService } from "../../synchronization.service";
import { ReadmeProjectsModule } from "../readme-projects/readme-projects.module";

import { AgentInstructionsCommand } from "./agent-instructions.command";
import { AgentInstructionsModule } from "./agent-instructions.module";
import { AgentInstructionsService } from "./agent-instructions.service";

describe(AgentInstructionsModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(
      AgentInstructionsModule,
      LoggerModule,
      ReadmeProjectsModule,
    );
    expectModuleProvides(
      AgentInstructionsModule,
      AgentInstructionsCommand,
      AgentInstructionsService,
      SynchronizationService,
    );
  });
});
