import { LanguagesModule } from "@coinagerie/languages";
import { Module } from "@nestjs/common";

import { DiscoveryModule } from "../discovery/discovery.module";
import { FoldingModule } from "../folding/folding.module";
import { WordsModule } from "../words/words.module";

import { VocabularyService } from "./vocabulary.service";

/**
 * Provides the vocabulary pipeline, wired to discovery, the language
 * tokenizers, word splitting, and folding.
 */
@Module({
  controllers: [],
  exports: [VocabularyService],
  imports: [DiscoveryModule, FoldingModule, LanguagesModule, WordsModule],
  providers: [VocabularyService],
})
export class VocabularyModule {}
