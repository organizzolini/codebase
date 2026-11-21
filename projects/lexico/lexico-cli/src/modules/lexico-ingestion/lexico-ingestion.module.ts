import { Module } from "@nestjs/common";

import { LexicoDatabaseModule } from "@codebase/lexico-db";
import { LoggerModule } from "@codebase/observability";

import { WordsModule } from "../lexemes/modules/words/words.module";
import { LibraryModule } from "../library/library.module";
import { CorpusScriptorumEcclesiasticorumLatinorumModule } from "../library/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.module";
import { EpigraphikDatenbankClaussSlabyModule } from "../library/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.module";
import { LatinLibraryModule } from "../library/modules/latin-library/latin-library.module";
import { PerseusModule } from "../library/modules/perseus/perseus.module";
import { ManualModule } from "../manual/manual.module";

import { LexicoIngestionCommand } from "./lexico-ingestion.command";
import { ClearModule } from "./modules/clear/clear.module";
import { DictionaryModule } from "./modules/dictionary/dictionary.module";
import { LiteratureModule } from "./modules/literature/literature.module";
import { WiktionaryModule } from "./modules/wiktionary/wiktionary.module";

/**
 * Root application module for lexicoIngestion.
 * Configures database connection, environment validation, and registers all ingestion sub-modules.
 */
@Module({
  controllers: [],
  exports: [LexicoIngestionCommand],
  imports: [
    ClearModule,
    CorpusScriptorumEcclesiasticorumLatinorumModule,
    DictionaryModule,
    EpigraphikDatenbankClaussSlabyModule,
    LatinLibraryModule,
    LexicoDatabaseModule,
    LibraryModule,
    LiteratureModule,
    LoggerModule,
    ManualModule,
    PerseusModule,
    WiktionaryModule,
    WordsModule,
  ],
  providers: [LexicoIngestionCommand],
})
export class LexicoIngestionModule {}
