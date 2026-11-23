import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  Author,
  LexicoDatabaseModule,
  Line,
  Text,
  Token,
  Word,
} from "@codebase/lexico-db";
import { LoggerModule } from "@codebase/observability";

import { NumeralsModule } from "../../../numerals/numerals.module";

import { LiteratureWordLinkingService } from "./literature-word-linking.service";
import { LiteratureCommand } from "./literature.command";
import { LiteratureService } from "./literature.service";
import { LiteratureAuthorEraService } from "./modules/author-era/literature-author-era.service";
import { LiteratureLibraryScanService } from "./modules/text-ingestion/literature-library-scan.service";
import { LiteratureTextIngestionService } from "./modules/text-ingestion/literature-text-ingestion.service";
import { LiteratureWordNormalizationService } from "./modules/text-ingestion/literature-word-normalization.service";

/**
 * Module for literature ingestion.
 */
@Module({
  controllers: [],
  exports: [LiteratureCommand, LiteratureService],
  imports: [
    LexicoDatabaseModule,
    TypeOrmModule.forFeature([Author, Text, Line, Token, Word]),
    LoggerModule,
    NumeralsModule,
  ],
  providers: [
    LiteratureAuthorEraService,
    LiteratureCommand,
    LiteratureLibraryScanService,
    LiteratureService,
    LiteratureTextIngestionService,
    LiteratureWordLinkingService,
    LiteratureWordNormalizationService,
  ],
})
export class LiteratureModule {}
