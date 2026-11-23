import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { CodeModule, MatrixModule } from "@codebase/meanderaw-core";

import { CharacteristicContextService } from "./characteristic-context.service";
import { CharacteristicsService } from "./characteristics.service";
import { PatternCharacteristicsModule } from "./modules/compound/modules/pattern/pattern-characteristics.module";
import { StructureCharacteristicsModule } from "./modules/compound/modules/structure/structure-characteristics.module";
import { EndCharacteristicsModule } from "./modules/path/modules/end/end-characteristics.module";
import { TileCrossingCharacteristicsModule } from "./modules/path/modules/tile-crossing/tile-crossing-characteristics.module";
import { TopologyCharacteristicsModule } from "./modules/path/modules/topology/topology-characteristics.module";
import { TurnCharacteristicsModule } from "./modules/path/modules/turn/turn-characteristics.module";
import { CornerCharacteristicsModule } from "./modules/submatrix/modules/corner/corner-characteristics.module";
import { CrossCharacteristicsModule } from "./modules/submatrix/modules/cross/cross-characteristics.module";
import { EmbeddedCharacteristicsModule } from "./modules/submatrix/modules/embedded/embedded-characteristics.module";
import { ForkCharacteristicsModule } from "./modules/submatrix/modules/fork/fork-characteristics.module";
import { LetterCharacteristicsModule } from "./modules/submatrix/modules/letter/letter-characteristics.module";
import { PointCharacteristicsModule } from "./modules/submatrix/modules/point/point-characteristics.module";
import { RectangleCharacteristicsModule } from "./modules/submatrix/modules/rectangle/rectangle-characteristics.module";
import { RunCharacteristicsModule } from "./modules/submatrix/modules/run/run-characteristics.module";

/**
 * Computes Characteristics from a Code alone, with no grid, SVG, filesystem or database.
 * `DrawRecordService` uses it to fill a row's Characteristics from its reading.
 *
 * Evaluators live in category group modules, which this module re-exports.
 * `CharacteristicsService` discovers them through `DiscoveryModule`.
 */
@Module({
  controllers: [],
  exports: [
    CharacteristicContextService,
    CharacteristicsService,
    CornerCharacteristicsModule,
    CrossCharacteristicsModule,
    EmbeddedCharacteristicsModule,
    EndCharacteristicsModule,
    PatternCharacteristicsModule,
    ForkCharacteristicsModule,
    LetterCharacteristicsModule,
    PointCharacteristicsModule,
    RectangleCharacteristicsModule,
    RunCharacteristicsModule,
    StructureCharacteristicsModule,
    TileCrossingCharacteristicsModule,
    TopologyCharacteristicsModule,
    TurnCharacteristicsModule,
  ],
  imports: [
    CodeModule,
    CornerCharacteristicsModule,
    CrossCharacteristicsModule,
    DiscoveryModule,
    EmbeddedCharacteristicsModule,
    EndCharacteristicsModule,
    PatternCharacteristicsModule,
    ForkCharacteristicsModule,
    LetterCharacteristicsModule,
    MatrixModule,
    PointCharacteristicsModule,
    RectangleCharacteristicsModule,
    RunCharacteristicsModule,
    StructureCharacteristicsModule,
    TileCrossingCharacteristicsModule,
    TopologyCharacteristicsModule,
    TurnCharacteristicsModule,
  ],
  providers: [CharacteristicContextService, CharacteristicsService],
})
export class CharacteristicsModule {}
