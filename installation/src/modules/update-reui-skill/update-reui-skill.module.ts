import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ReporterModule } from "../reporter/reporter.module";

import { UpdateReuiSkillCommand } from "./update-reui-skill.command";
import { UpdateReuiSkillService } from "./update-reui-skill.service";

/** Provides the command that refreshes the vendored ReUI skill. */
@Module({
  controllers: [],
  exports: [UpdateReuiSkillCommand, UpdateReuiSkillService],
  imports: [LoggerModule, ReporterModule],
  providers: [UpdateReuiSkillCommand, UpdateReuiSkillService],
})
export class UpdateReuiSkillModule {}
