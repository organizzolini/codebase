import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ImageTagsCommand } from "./image-tags.command";
import { ImageTagsService } from "./image-tags.service";

/** Provides the command that writes a release's image tag into the Helm values. */
@Module({
  controllers: [],
  exports: [ImageTagsCommand, ImageTagsService],
  imports: [LoggerModule],
  providers: [ImageTagsCommand, ImageTagsService],
})
export class ImageTagsModule {}
