import { Module } from "@nestjs/common";

import { Author, Line, Text, Token, TypeOrmModule } from "@codebase/lexico-db";

import { LiteratureResolver } from "./literature.resolver";
import { LiteratureService } from "./literature.service";
import { AuthorsResolver } from "./modules/authors/authors.resolver";
import { LinesResolver } from "./modules/lines/lines.resolver";
import { LiteratureRelationsLoader } from "./modules/relations/literature-relations.loader";
import { LiteratureRelationsService } from "./modules/relations/literature-relations.service";
import { TextsResolver } from "./modules/texts/texts.resolver";
import { TokensResolver } from "./modules/tokens/tokens.resolver";

/**
 * Module providing literature browsing, hierarchy, and search endpoints.
 */
@Module({
  controllers: [],
  exports: [LiteratureService],
  imports: [TypeOrmModule.forFeature([Author, Text, Line, Token])],
  providers: [
    AuthorsResolver,
    TextsResolver,
    LinesResolver,
    TokensResolver,
    LiteratureResolver,
    LiteratureService,
    LiteratureRelationsService,
    LiteratureRelationsLoader,
  ],
})
export class LiteratureModule {}
