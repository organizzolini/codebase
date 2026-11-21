import { Module } from "@nestjs/common";

import { LexemesModule } from "../../../lexemes/lexemes.module";
import { FormsModule } from "../../../lexemes/modules/forms/forms.module";
import { PrincipalPartsModule } from "../../../lexemes/modules/principal-parts/principal-parts.module";
import { PronunciationModule } from "../../../lexemes/modules/pronunciation/pronunciation.module";
import { TranslationsModule } from "../../../lexemes/modules/translations/translations.module";
import { WordsModule } from "../../../lexemes/modules/words/words.module";
import { ManualModule } from "../../../manual/manual.module";

import { DictionaryCommand } from "./dictionary.command";

/**
 * TODO: Document the dictionary module.
 */
@Module({
  controllers: [],
  exports: [DictionaryCommand],
  imports: [
    FormsModule,
    LexemesModule,
    ManualModule,
    PrincipalPartsModule,
    PronunciationModule,
    TranslationsModule,
    WordsModule,
  ],
  providers: [DictionaryCommand],
})
export class DictionaryModule {}
