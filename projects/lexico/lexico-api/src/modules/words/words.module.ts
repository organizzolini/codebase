import { Module } from "@nestjs/common";

import {
  TypeOrmModule,
  Word,
  WordForm,
  WordLexeme,
} from "@codebase/lexico-entities";

import { LexemeWordFormLoader } from "./lexeme-word-form.loader";
import { LexemeWordFormResolver } from "./lexeme-word-form.resolver";
import { WordFormResolver } from "./word-form.resolver";
import { WordLexemeResolver } from "./word-lexeme.resolver";
import { WordLinkLoader } from "./word-link.loader";
import { WordsResolver } from "./words.resolver";
import { WordsService } from "./words.service";

/**
 * Module exposing surface-word lookups and morphologically-linked dictionary data.
 */
@Module({
  controllers: [],
  exports: [WordsService],
  imports: [TypeOrmModule.forFeature([Word, WordForm, WordLexeme])],
  providers: [
    LexemeWordFormLoader,
    LexemeWordFormResolver,
    WordFormResolver,
    WordLexemeResolver,
    WordLinkLoader,
    WordsResolver,
    WordsService,
  ],
})
export class WordsModule {}
