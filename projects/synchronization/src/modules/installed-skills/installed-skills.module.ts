import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { SynchronizationService } from "../synchronization/synchronization.service";

import { InstalledSkillsProcessService } from "./installed-skills-process.service";
import { InstalledSkillsCommand } from "./installed-skills.command";
import { InstalledSkillsService } from "./installed-skills.service";

/**
 * Provides the installed-skills command, which checks and restores the skills
 * `skills-lock.json` declares.
 *
 * `SynchronizationService` is provided here directly rather than imported
 * from a shared module, since no module exports it for reuse across sibling
 * commands. `ConfigService` comes from the global `ConfigModule`.
 */
@Module({
  controllers: [],
  exports: [InstalledSkillsCommand, InstalledSkillsService],
  imports: [LoggerModule],
  providers: [
    InstalledSkillsCommand,
    InstalledSkillsProcessService,
    InstalledSkillsService,
    SynchronizationService,
  ],
})
export class InstalledSkillsModule {}
