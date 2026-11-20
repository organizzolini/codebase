import { Module } from "@nestjs/common";

import { EndCharacteristicsModule } from "../../../path/modules/end/end-characteristics.module";
import { TileCrossingCharacteristicsModule } from "../../../path/modules/tile-crossing/tile-crossing-characteristics.module";
import { TopologyCharacteristicsModule } from "../../../path/modules/topology/topology-characteristics.module";
import { TurnCharacteristicsModule } from "../../../path/modules/turn/turn-characteristics.module";
import { CornerCharacteristicsModule } from "../../../submatrix/modules/corner/corner-characteristics.module";
import { CrossCharacteristicsModule } from "../../../submatrix/modules/cross/cross-characteristics.module";
import { EmbeddedCharacteristicsModule } from "../../../submatrix/modules/embedded/embedded-characteristics.module";
import { ForkCharacteristicsModule } from "../../../submatrix/modules/fork/fork-characteristics.module";
import { PointCharacteristicsModule } from "../../../submatrix/modules/point/point-characteristics.module";
import { RunCharacteristicsModule } from "../../../submatrix/modules/run/run-characteristics.module";
import { CompoundUtilitiesModule } from "../../compound-utilities.module";
import { StructureCharacteristicsModule } from "../structure/structure-characteristics.module";

import { IsArcadeCharacteristicService } from "./modules/junctions/is-arcade-characteristic.service";
import { IsCombCharacteristicService } from "./modules/junctions/is-comb-characteristic.service";
import { IsCrossCharacteristicService } from "./modules/junctions/is-cross-characteristic.service";
import { IsForkCharacteristicService } from "./modules/junctions/is-fork-characteristic.service";
import { IsMeshCharacteristicService } from "./modules/junctions/is-mesh-characteristic.service";
import { IsPureTreeCharacteristicService } from "./modules/junctions/is-pure-tree-characteristic.service";
import { IsBarsCharacteristicService } from "./modules/plain-strands/is-bars-characteristic.service";
import { IsDotsCharacteristicService } from "./modules/plain-strands/is-dots-characteristic.service";
import { IsLinesCharacteristicService } from "./modules/plain-strands/is-lines-characteristic.service";
import { IsParallelCharacteristicService } from "./modules/plain-strands/is-parallel-characteristic.service";
import { IsSnakeCharacteristicService } from "./modules/plain-strands/is-snake-characteristic.service";
import { IsWaterfallsCharacteristicService } from "./modules/plain-strands/is-waterfalls-characteristic.service";
import { IsBoxesCharacteristicService } from "./modules/windings/is-boxes-characteristic.service";
import { IsChainCharacteristicService } from "./modules/windings/is-chain-characteristic.service";
import { IsClaspsCharacteristicService } from "./modules/windings/is-clasps-characteristic.service";
import { IsDoubleChainCharacteristicService } from "./modules/windings/is-double-chain-characteristic.service";
import { IsSwirlCharacteristicService } from "./modules/windings/is-swirl-characteristic.service";
import { IsWhirlCharacteristicService } from "./modules/windings/is-whirl-characteristic.service";
import { StrandUtilitiesService } from "./strand-utilities.service";

/**
 * Provides and exports every compound pattern characteristic evaluator, one boolean per
 * named pattern, as one group. It imports the groups these predicates read and the shared
 * `CompoundUtilitiesModule`, and provides its own `StrandUtilitiesService`.
 */
@Module({
  controllers: [],
  exports: [
    IsArcadeCharacteristicService,
    IsBarsCharacteristicService,
    IsBoxesCharacteristicService,
    IsChainCharacteristicService,
    IsClaspsCharacteristicService,
    IsCombCharacteristicService,
    IsCrossCharacteristicService,
    IsDotsCharacteristicService,
    IsDoubleChainCharacteristicService,
    IsForkCharacteristicService,
    IsLinesCharacteristicService,
    IsMeshCharacteristicService,
    IsParallelCharacteristicService,
    IsPureTreeCharacteristicService,
    IsSnakeCharacteristicService,
    IsSwirlCharacteristicService,
    IsWaterfallsCharacteristicService,
    IsWhirlCharacteristicService,
  ],
  imports: [
    CompoundUtilitiesModule,
    CornerCharacteristicsModule,
    CrossCharacteristicsModule,
    EmbeddedCharacteristicsModule,
    EndCharacteristicsModule,
    ForkCharacteristicsModule,
    PointCharacteristicsModule,
    RunCharacteristicsModule,
    StructureCharacteristicsModule,
    TileCrossingCharacteristicsModule,
    TopologyCharacteristicsModule,
    TurnCharacteristicsModule,
  ],
  providers: [
    IsArcadeCharacteristicService,
    IsBarsCharacteristicService,
    IsBoxesCharacteristicService,
    IsChainCharacteristicService,
    IsClaspsCharacteristicService,
    IsCombCharacteristicService,
    IsCrossCharacteristicService,
    IsDotsCharacteristicService,
    IsDoubleChainCharacteristicService,
    IsForkCharacteristicService,
    IsLinesCharacteristicService,
    IsMeshCharacteristicService,
    IsParallelCharacteristicService,
    IsPureTreeCharacteristicService,
    IsSnakeCharacteristicService,
    IsSwirlCharacteristicService,
    IsWaterfallsCharacteristicService,
    IsWhirlCharacteristicService,
    StrandUtilitiesService,
  ],
})
export class PatternCharacteristicsModule {}
