import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { LibraryCommand } from "./library.command";
import { LIBRARY_PROVIDERS_TOKEN } from "./library.constants";
import { CorpusScriptorumEcclesiasticorumLatinorumLibraryService } from "./modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum-library.service";
import { EpigraphikDatenbankClaussSlabyLibraryService } from "./modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby-library.service";
import { LatinLibraryBuilderService } from "./modules/latin-library/latin-library-builder.service";
import { LatinLibraryService } from "./modules/latin-library/latin-library.service";
import { PerseusLibraryTextExtractionService } from "./modules/perseus/perseus-library-text-extraction.service";
import { PerseusLibraryService } from "./modules/perseus/perseus-library.service";

import type { LibrarySourceProvider } from "./library.types";

/**
 * Scrape literature from various sources.
 */
@Module({
  controllers: [],
  exports: [LibraryCommand],
  imports: [LoggerModule],
  providers: [
    LibraryCommand,
    CorpusScriptorumEcclesiasticorumLatinorumLibraryService,
    EpigraphikDatenbankClaussSlabyLibraryService,
    LatinLibraryBuilderService,
    LatinLibraryService,
    PerseusLibraryService,
    PerseusLibraryTextExtractionService,
    {
      inject: [
        CorpusScriptorumEcclesiasticorumLatinorumLibraryService,
        EpigraphikDatenbankClaussSlabyLibraryService,
        LatinLibraryService,
        PerseusLibraryService,
      ],
      provide: LIBRARY_PROVIDERS_TOKEN,
      useFactory: (
        corpusScriptorumEcclesiasticorumLatinorum: CorpusScriptorumEcclesiasticorumLatinorumLibraryService,
        epigraphikDatenbankClaussSlaby: EpigraphikDatenbankClaussSlabyLibraryService,
        latinLibrary: LatinLibraryService,
        perseus: PerseusLibraryService,
      ): LibrarySourceProvider[] => {
        return [
          corpusScriptorumEcclesiasticorumLatinorum,
          epigraphikDatenbankClaussSlaby,
          latinLibrary,
          perseus,
        ];
      },
    },
  ],
})
export class LibraryModule {}
