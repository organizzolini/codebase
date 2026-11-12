import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { CodeModule } from "../code/code.module";
import { MatrixModule } from "../matrix/matrix.module";

import { CharacteristicContextService } from "./characteristic-context.service";
import { CharacteristicsService } from "./characteristics.service";
import { PatternCharacteristicsModule } from "./compound/pattern/pattern-characteristics.module";
import { StructureCharacteristicsModule } from "./compound/structure/structure-characteristics.module";
import { EndCharacteristicsModule } from "./path/end/end-characteristics.module";
import { TileCrossingCharacteristicsModule } from "./path/tile-crossing/tile-crossing-characteristics.module";
import { TopologyCharacteristicsModule } from "./path/topology/topology-characteristics.module";
import { TurnCharacteristicsModule } from "./path/turn/turn-characteristics.module";
import { CornerCharacteristicsModule } from "./submatrix/corner/corner-characteristics.module";
import { CrossCharacteristicsModule } from "./submatrix/cross/cross-characteristics.module";
import { EmbeddedCharacteristicsModule } from "./submatrix/embedded/embedded-characteristics.module";
import { ForkCharacteristicsModule } from "./submatrix/fork/fork-characteristics.module";
import { LetterCharacteristicsModule } from "./submatrix/letter/letter-characteristics.module";
import { PointCharacteristicsModule } from "./submatrix/point/point-characteristics.module";
import { RectangleCharacteristicsModule } from "./submatrix/rectangle/rectangle-characteristics.module";
import { RunCharacteristicsModule } from "./submatrix/run/run-characteristics.module";

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
