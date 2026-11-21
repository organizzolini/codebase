import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Lexeme } from "@codebase/lexico-db";
import { LoggerModule } from "@codebase/observability";

import { PronunciationClassicalService } from "./modules/pronunciation-rules/pronunciation-classical.service";
import { PronunciationClassifierService } from "./modules/pronunciation-rules/pronunciation-classifier.service";
import { PronunciationEcclesiasticalService } from "./modules/pronunciation-rules/pronunciation-ecclesiastical.service";
import { PronunciationPhonemesService } from "./modules/pronunciation-rules/pronunciation-phonemes.service";
import { PronunciationService } from "./pronunciation.service";

/**
 * Pronunciation parsing and variant classification module.
 *
 * Manages classification of Latin pronunciation phonemes for both
 * Classical and Ecclesiastical traditions, along with Wiktionary IPA integration.
 */
@Module({
  controllers: [],
  exports: [PronunciationService],
  imports: [TypeOrmModule.forFeature([Lexeme]), LoggerModule],
  providers: [
    PronunciationPhonemesService,
    PronunciationClassicalService,
    PronunciationEcclesiasticalService,
    PronunciationClassifierService,
    PronunciationService,
  ],
})
export class PronunciationModule {}
