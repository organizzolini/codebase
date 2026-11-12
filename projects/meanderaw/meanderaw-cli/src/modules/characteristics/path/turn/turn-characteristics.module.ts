import { Module } from "@nestjs/common";

import { ConnectivityModule } from "../../connectivity/connectivity.module";
import { PointCharacteristicsModule } from "../../submatrix/point/point-characteristics.module";
import { PathUtilitiesModule } from "../path-utilities.module";

import { BottomBorderTouchCountCharacteristicService } from "./bottom-border-touch-count-characteristic.service";
import { InflectionCountCharacteristicService } from "./inflection-count-characteristic.service";
import { MaxMonotonicTurnLengthCharacteristicService as MaximumMonotonicTurnLengthCharacteristicService } from "./max-monotonic-turn-length-characteristic.service";
import { ReversesAtItsTightestTurnCharacteristicService } from "./reverses-at-its-tightest-turn-characteristic.service";
import { TightestTurnCountCharacteristicService } from "./tightest-turn-count-characteristic.service";
import { TopBorderTouchCountCharacteristicService } from "./top-border-touch-count-characteristic.service";
import { TotalTurnCountCharacteristicService } from "./total-turn-count-characteristic.service";

/**
 * Provides and exports every turn-dynamics path characteristic evaluator, re-exported as one
 * group. It imports `ConnectivityModule` and `PointCharacteristicsModule` for their shared
 * services rather than providing copies.
 */
@Module({
  controllers: [],
  exports: [
    BottomBorderTouchCountCharacteristicService,
    InflectionCountCharacteristicService,
    MaximumMonotonicTurnLengthCharacteristicService,
    ReversesAtItsTightestTurnCharacteristicService,
    TightestTurnCountCharacteristicService,
    TopBorderTouchCountCharacteristicService,
    TotalTurnCountCharacteristicService,
  ],
  imports: [
    ConnectivityModule,
    PathUtilitiesModule,
    PointCharacteristicsModule,
  ],
  providers: [
    BottomBorderTouchCountCharacteristicService,
    InflectionCountCharacteristicService,
    MaximumMonotonicTurnLengthCharacteristicService,
    ReversesAtItsTightestTurnCharacteristicService,
    TightestTurnCountCharacteristicService,
    TopBorderTouchCountCharacteristicService,
    TotalTurnCountCharacteristicService,
  ],
})
export class TurnCharacteristicsModule {}
