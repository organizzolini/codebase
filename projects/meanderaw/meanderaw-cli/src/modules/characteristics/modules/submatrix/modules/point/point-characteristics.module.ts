import { Module } from "@nestjs/common";

import { SubmatrixUtilitiesModule } from "../../submatrix-utilities.module";

import { EastEdgeCountCharacteristicService } from "./modules/directional-edge-counts/east-edge-count-characteristic.service";
import { NorthEdgeCountCharacteristicService } from "./modules/directional-edge-counts/north-edge-count-characteristic.service";
import { SouthEdgeCountCharacteristicService } from "./modules/directional-edge-counts/south-edge-count-characteristic.service";
import { WestEdgeCountCharacteristicService } from "./modules/directional-edge-counts/west-edge-count-characteristic.service";
import { DoubleHorizontalEdgeCountCharacteristicService } from "./modules/edge-counts/double-horizontal-edge-count-characteristic.service";
import { DoubleVerticalEdgeCountCharacteristicService } from "./modules/edge-counts/double-vertical-edge-count-characteristic.service";
import { EdgeCountCharacteristicService } from "./modules/edge-counts/edge-count-characteristic.service";
import { DensityCharacteristicService } from "./modules/ink-counts/density-characteristic.service";
import { DotCountCharacteristicService } from "./modules/ink-counts/dot-count-characteristic.service";
import { InkPointCountCharacteristicService } from "./modules/ink-counts/ink-point-count-characteristic.service";
import { PointUtilitiesService } from "./point-utilities.service";

/**
 * Provides and exports every 1×1 point characteristic evaluator — bare
 * points, straight and directional edges, and the grid-wide edge, ink, and
 * density tallies read from the same points — as one group
 * `CharacteristicsModule` imports and re-exports.
 */
@Module({
  controllers: [],
  exports: [
    DensityCharacteristicService,
    DotCountCharacteristicService,
    DoubleHorizontalEdgeCountCharacteristicService,
    DoubleVerticalEdgeCountCharacteristicService,
    EastEdgeCountCharacteristicService,
    EdgeCountCharacteristicService,
    InkPointCountCharacteristicService,
    NorthEdgeCountCharacteristicService,
    PointUtilitiesService,
    SouthEdgeCountCharacteristicService,
    WestEdgeCountCharacteristicService,
  ],
  imports: [SubmatrixUtilitiesModule],
  providers: [
    DensityCharacteristicService,
    DotCountCharacteristicService,
    DoubleHorizontalEdgeCountCharacteristicService,
    DoubleVerticalEdgeCountCharacteristicService,
    EastEdgeCountCharacteristicService,
    EdgeCountCharacteristicService,
    InkPointCountCharacteristicService,
    NorthEdgeCountCharacteristicService,
    PointUtilitiesService,
    SouthEdgeCountCharacteristicService,
    WestEdgeCountCharacteristicService,
  ],
})
export class PointCharacteristicsModule {}
