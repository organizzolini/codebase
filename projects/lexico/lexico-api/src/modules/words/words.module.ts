import { Module } from "@nestjs/common";

import { TypeOrmModule, Word, WordForm, WordLexeme } from "@codebase/lexico-db";

import { LexemeWordFormLoader } from "./modules/word-forms/lexeme-word-form.loader";
import { LexemeWordFormResolver } from "./modules/word-forms/lexeme-word-form.resolver";
import { WordFormResolver } from "./modules/word-forms/word-form.resolver";
import { WordLexemeResolver } from "./modules/word-lexemes/word-lexeme.resolver";
import { WordLinkLoader } from "./modules/word-lexemes/word-link.loader";
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
