import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";
import { Module } from "@nestjs/common";

import { CharacteristicsModule } from "../characteristics/characteristics.module";
import { CodeModule } from "../code/code.module";
import { CorpusModule } from "../corpus/corpus.module";
import { DrawingModule } from "../drawing/drawing.module";
import { EnumerationModule } from "../enumeration/enumeration.module";
import { GeometryModule } from "../geometry/geometry.module";
import { SymmetryModule } from "../symmetry/symmetry.module";

import { DrawCodeService } from "./draw-code.service";
import { DrawEnumerationService } from "./draw-enumeration.service";
import { DrawIndexService } from "./draw-index.service";
import { DrawPoolService } from "./draw-pool.service";
import { DrawRecordService } from "./draw-record.service";
import { DrawWorkerService } from "./draw-worker.service";
import { DrawCommand } from "./draw.command";

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
