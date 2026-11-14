import { Module } from "@nestjs/common";

import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { CharacteristicsModule } from "../characteristics/characteristics.module";
import { CodeModule } from "../code/code.module";
import { EnumerationModule } from "../enumeration/enumeration.module";

import { CorpusService } from "./corpus.service";

/**
 * Registers `CorpusService`: the generic decoder, Characteristic computation,
 * meander database, and enumeration that decides which historical entries
 * must be preserved.
 */
@Module({
  controllers: [],
  exports: [CorpusService],
  imports: [
    CharacteristicsModule,
    CodeModule,
    MeanderawDatabaseModule,
    EnumerationModule,
  ],
  providers: [CorpusService],
})
export class CorpusModule {}
