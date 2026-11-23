import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { InstalledSkillsProcessService } from "./installed-skills-process.service";
import { InstalledSkillsCommand } from "./installed-skills.command";
import { InstalledSkillsService } from "./installed-skills.service";

/**
 * Provides the installed-skills command, which checks and restores the skills
 * `skills-lock.json` declares. Not part of `setup`: it runs from `postinstall`,
 * the session hook, and its own Nx target. `ConfigService` comes from the
 * global `ConfigModule`.
 */
@Module({
  controllers: [],
  exports: [InstalledSkillsCommand, InstalledSkillsService],
  imports: [LoggerModule],
  providers: [
    InstalledSkillsCommand,
    InstalledSkillsProcessService,
    InstalledSkillsService,
  ],
})
export class InstalledSkillsModule {}
