import { Module } from "@nestjs/common";

import { SemanticReleaseService } from "./semantic-release.service";

/** Provides the release of the codebase through semantic-release's API. */
@Module({
  controllers: [],
  exports: [SemanticReleaseService],
  imports: [],
  providers: [SemanticReleaseService],
})
export class SemanticReleaseModule {}
