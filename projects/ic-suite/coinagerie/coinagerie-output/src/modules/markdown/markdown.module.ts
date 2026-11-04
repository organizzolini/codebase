import { Module } from "@nestjs/common";

import { MarkdownService } from "./markdown.service";

/**
 * Provides the markdown glossary format: rendering, parsing, and splicing the
 * anchored bullet block.
 */
@Module({
  controllers: [],
  exports: [MarkdownService],
  imports: [],
  providers: [MarkdownService],
})
export class MarkdownModule {}
