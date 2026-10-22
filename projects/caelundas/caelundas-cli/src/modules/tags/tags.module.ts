import { Module } from "@nestjs/common";

import { TagsService } from "./tags.service";

/**
 * Resolves the raw tag strings detectors attach to events into nodes of the
 * stored tag tree. Exports {@link TagsService}.
 */
@Module({
  controllers: [],
  exports: [TagsService],
  imports: [],
  providers: [TagsService],
})
export class TagsModule {}
