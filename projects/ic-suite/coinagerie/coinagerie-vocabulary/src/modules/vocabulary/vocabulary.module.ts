import { LanguagesModule } from "@coinagerie/languages";
import { Module } from "@nestjs/common";

import { DiscoveryModule } from "../discovery/discovery.module";
import { WordsModule } from "../words/words.module";

import { VocabularyService } from "./vocabulary.service";

/**
 * Provides the vocabulary pipeline, wired to discovery, the language
 * tokenizers, and word splitting.
 */
@Module({
  controllers: [],
  exports: [VocabularyService],
  imports: [DiscoveryModule, LanguagesModule, WordsModule],
  providers: [VocabularyService],
})
export class VocabularyModule {}
