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

import { LiteratureCommand } from "./literature.command";
import { LiteratureService } from "./literature.service";
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
    LiteratureCommand,
    LiteratureLibraryScanService,
    LiteratureService,
    LiteratureTextIngestionService,
    LiteratureWordNormalizationService,
  ],
})
export class LiteratureModule {}
