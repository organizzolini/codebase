import { ConfigurationModule } from "@callidescope/configuration";
import { WorkspaceModule } from "@callidescope/graph";
import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { LimitsCommand } from "./limits.command";
import { LimitsService } from "./limits.service";
import { RenderLimitsService } from "./render-limits.service";

/**
 * NestJS module that wires the `limits` command.
 *
 * Imports callidescope's configuration and workspace modules rather than
 * reimplementing them, so the listing finds the same projects, skips the same
 * exclusions, and resolves limits through the one resolver a gate reads.
 */
@Module({
  controllers: [],
  exports: [LimitsCommand, LimitsService],
  imports: [ConfigurationModule, LoggerModule, WorkspaceModule],
  providers: [LimitsCommand, LimitsService, RenderLimitsService],
})
export class LimitsModule {}
