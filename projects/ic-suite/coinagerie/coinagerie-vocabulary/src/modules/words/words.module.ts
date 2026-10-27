import { Module } from "@nestjs/common";

import { WordsService } from "./words.service";

/**
 * Provides the splitting and normalizing of identifiers and paths into
 * words.
 */
@Module({
  controllers: [],
  exports: [WordsService],
  imports: [],
  providers: [WordsService],
})
export class WordsModule {}
