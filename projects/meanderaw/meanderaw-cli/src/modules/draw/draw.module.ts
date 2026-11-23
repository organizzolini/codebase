import { Module } from "@nestjs/common";

import {
  CodeModule,
  DrawingModule,
  GeometryModule,
  SymmetryModule,
} from "@codebase/meanderaw-core";
import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { CharacteristicsModule } from "../characteristics/characteristics.module";
import { CorpusModule } from "../corpus/corpus.module";
import { EnumerationModule } from "../enumeration/enumeration.module";

import { DrawCommand } from "./draw.command";
import { DrawCodeService } from "./modules/enumeration/draw-code.service";
import { DrawEnumerationService } from "./modules/enumeration/draw-enumeration.service";
import { DrawRecordService } from "./modules/enumeration/draw-record.service";
import { DrawIndexService } from "./modules/index/draw-index.service";
import { DrawPoolService } from "./modules/pool/draw-pool.service";
import { DrawWorkerService } from "./modules/pool/draw-worker.service";

/**
 * Registers the `draw` command and the services it runs: enumeration,
 * `--code` persistence, and the index pages. Every import serves one pipeline
 * that decodes, renders, measures, and persists each Code.
 */
@Module({
  controllers: [],
  exports: [DrawCommand],
  imports: [
    CorpusModule,
    CharacteristicsModule,
    MeanderawDatabaseModule,
    CodeModule,
    EnumerationModule,
    DrawingModule,
    SymmetryModule,
    GeometryModule,
  ],
  providers: [
    DrawCodeService,
    DrawCommand,
    DrawEnumerationService,
    DrawIndexService,
    DrawPoolService,
    DrawRecordService,
    DrawWorkerService,
  ],
})
export class DrawModule {}
