import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { SynchronizationService } from "../synchronization/synchronization.service";

import { ProjectPortsCommand } from "./project-ports.command";
import { ProjectPortsService } from "./project-ports.service";

/**
 * Wires the project-ports command, which makes the port of every `*-api` and
 * `*-web` application the one its name hashes to.
 */
@Module({
  controllers: [],
  exports: [ProjectPortsCommand, ProjectPortsService],
  imports: [LoggerModule],
  providers: [ProjectPortsCommand, ProjectPortsService, SynchronizationService],
})
export class ProjectPortsModule {}
