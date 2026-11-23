import { Module } from "@nestjs/common";

import {
  Author,
  Line,
  Text,
  Token,
  TypeOrmModule,
  WordForm,
  WordLexeme,
} from "@codebase/lexico-db";

import { LiteratureResolver } from "./literature.resolver";
import { LiteratureService } from "./literature.service";
import { AuthorsResolver } from "./modules/authors/authors.resolver";
import { LibraryResolver } from "./modules/library/library.resolver";
import { LibraryService } from "./modules/library/library.service";
import { LinesResolver } from "./modules/lines/lines.resolver";
import { LiteratureRelationsLoader } from "./modules/relations/literature-relations.loader";
import { LiteratureRelationsService } from "./modules/relations/literature-relations.service";
import { TextsResolver } from "./modules/texts/texts.resolver";
import { TokensResolver } from "./modules/tokens/tokens.resolver";
import { WordCandidatesResolver } from "./modules/word-candidates/word-candidates.resolver";
import { WordCandidatesService } from "./modules/word-candidates/word-candidates.service";

/**
 * Module providing literature browsing, hierarchy, and search endpoints.
 */
@Module({
  controllers: [],
  exports: [LiteratureService],
  imports: [
    TypeOrmModule.forFeature([Author, Text, Line, Token, WordForm, WordLexeme]),
  ],
  providers: [
    AuthorsResolver,
    TextsResolver,
    LinesResolver,
    TokensResolver,
    LiteratureResolver,
    LiteratureService,
    LiteratureRelationsService,
    LiteratureRelationsLoader,
    LibraryResolver,
    LibraryService,
    WordCandidatesResolver,
    WordCandidatesService,
  ],
})
export class LiteratureModule {}
