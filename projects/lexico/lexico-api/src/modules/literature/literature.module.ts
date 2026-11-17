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

import { AuthorsResolver } from "./authors.resolver";
import { LibraryResolver } from "./library.resolver";
import { LibraryService } from "./library.service";
import { LinesResolver } from "./lines.resolver";
import { LiteratureRelationsLoader } from "./literature-relations.loader";
import { LiteratureRelationsService } from "./literature-relations.service";
import { LiteratureResolver } from "./literature.resolver";
import { LiteratureService } from "./literature.service";
import { TextsResolver } from "./texts.resolver";
import { TokensResolver } from "./tokens.resolver";
import { WordCandidatesResolver } from "./word-candidates.resolver";
import { WordCandidatesService } from "./word-candidates.service";

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
