import { Module } from "@nestjs/common";

import { CharacteristicsModule } from "../characteristics/characteristics.module";
import { CodeModule } from "../code/code.module";
import { DatabaseModule } from "../database/database.module";
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
    DatabaseModule,
    EnumerationModule,
  ],
  providers: [CorpusService],
})
export class CorpusModule {}
