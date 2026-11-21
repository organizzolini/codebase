import { Module } from "@nestjs/common";

import { EphemerisService } from "./ephemeris.service";
import { EphemerisAggregationService } from "./modules/aggregation/ephemeris-aggregation.service";
import { EphemerisConstantsService } from "./modules/constants-lookup/ephemeris-constants.service";
import { EphemerisCoordinateService } from "./modules/coordinates/ephemeris-coordinate.service";
import { EphemerisHorizonService } from "./modules/horizon/ephemeris-horizon.service";
import { MathModule } from "./modules/math/math.module";
import { EphemerisPhenomenaService } from "./modules/phenomena/ephemeris-phenomena.service";
import { EphemerisTimeService } from "./modules/time/ephemeris-time.service";

/**
 * NestJS module providing Swiss Ephemeris astronomical calculations.
 * Exports {@link EphemerisService} for computing planetary positions and illumination.
 */
@Module({
  controllers: [],
  exports: [EphemerisService],
  imports: [MathModule],
  providers: [
    EphemerisTimeService,
    EphemerisConstantsService,
    EphemerisCoordinateService,
    EphemerisPhenomenaService,
    EphemerisHorizonService,
    EphemerisAggregationService,
    EphemerisService,
  ],
})
export class EphemerisModule {}
