import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Lexeme } from "@codebase/lexico-db";

import { LexemesService } from "./lexemes.service";
import { EtymologyModule } from "./modules/etymology/etymology.module";
import { FormsModule } from "./modules/forms/forms.module";
import { PartOfSpeechModule } from "./modules/part-of-speech/part-of-speech.module";
import { PrincipalPartsModule } from "./modules/principal-parts/principal-parts.module";
import { PronunciationModule } from "./modules/pronunciation/pronunciation.module";
import { TranslationsModule } from "./modules/translations/translations.module";
import { WordsModule } from "./modules/words/words.module";

/**
 * Wires POS detection, pronunciation parsing, and full Wiktionary entry
 * orchestration into a single injectable module.
 */
@Module({
  controllers: [],
  exports: [LexemesService],
  imports: [
    TypeOrmModule.forFeature([Lexeme]),
    EtymologyModule,
    FormsModule,
    PartOfSpeechModule,
    PrincipalPartsModule,
    PronunciationModule,
    TranslationsModule,
    WordsModule,
  ],
  providers: [LexemesService],
})
export class LexemesModule {}
