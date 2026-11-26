import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { SynchronizationService } from "../../synchronization.service";
import { ReadmeProjectsModule } from "../readme-projects/readme-projects.module";

import { AgentInstructionsCommand } from "./agent-instructions.command";
import { AgentInstructionsService } from "./agent-instructions.service";

/**
 * Provides the agent-instructions derivation. `SynchronizationService` is
 * provided here directly, as in every sibling derivation, and the project list
 * comes from `readme-projects`.
 */
@Module({
  controllers: [],
  exports: [AgentInstructionsCommand, AgentInstructionsService],
  imports: [LoggerModule, ReadmeProjectsModule],
  providers: [
    AgentInstructionsCommand,
    AgentInstructionsService,
    SynchronizationService,
  ],
})
export class AgentInstructionsModule {}
