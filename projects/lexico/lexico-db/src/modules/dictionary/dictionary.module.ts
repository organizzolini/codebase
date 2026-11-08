import { Module } from "@nestjs/common";

import { DictionaryService } from "./dictionary.service";

/**
 * TODO: Document the dictionary module.
 */
@Module({
  controllers: [],
  exports: [DictionaryService],
  imports: [],
  providers: [DictionaryService],
})
export class DictionaryModule {}
