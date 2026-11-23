import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { MainTipModule } from "../main-tip/main-tip.module";
import { SemanticReleaseModule } from "../semantic-release/semantic-release.module";

import { TagCodebaseCommand } from "./tag-codebase.command";
import { TagCodebaseService } from "./tag-codebase.service";

/** Provides the command that versions and tags the codebase itself. */
@Module({
  controllers: [],
  exports: [TagCodebaseCommand, TagCodebaseService],
  imports: [LoggerModule, MainTipModule, SemanticReleaseModule],
  providers: [TagCodebaseCommand, TagCodebaseService],
})
export class TagCodebaseModule {}
