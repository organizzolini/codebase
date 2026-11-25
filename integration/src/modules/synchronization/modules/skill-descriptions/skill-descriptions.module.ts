import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { SkillDescriptionsCommand } from "./skill-descriptions.command";
import { SkillDescriptionsService } from "./skill-descriptions.service";

/** Provides the skill-descriptions check command. */
@Module({
  controllers: [],
  exports: [SkillDescriptionsCommand, SkillDescriptionsService],
  imports: [LoggerModule],
  providers: [SkillDescriptionsCommand, SkillDescriptionsService],
})
export class SkillDescriptionsModule {}
