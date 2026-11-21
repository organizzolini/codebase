import { Module } from "@nestjs/common";

import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { MathModule } from "../../../ephemeris/modules/math/math.module";
import { ProgressiveUtilitiesModule } from "../../../progressive/progressive-utilities.module";

import { EclipseEventService } from "./eclipse-event.service";
import { EclipsesService } from "./eclipses.service";
import { EclipseCalculationService } from "./modules/calculation/eclipse-calculation.service";
import { EclipseClassificationService } from "./modules/calculation/eclipse-classification.service";
import { EclipseGeometryService } from "./modules/geometry/eclipse-geometry.service";
import { EclipseTopocentricService } from "./modules/geometry/eclipse-topocentric.service";

/**
 * NestJS module for solar and lunar eclipse event detection.
 * Exports {@link EclipsesService} which identifies eclipse phases (beginning, maximum, ending)
 * in both geocentric and topocentric reference frames.
 */
@Module({
  controllers: [],
  exports: [EclipsesService],
  imports: [EphemerisModule, MathModule, ProgressiveUtilitiesModule],
  providers: [
    EclipseClassificationService,
    EclipseEventService,
    EclipseGeometryService,
    EclipseTopocentricService,
    EclipseCalculationService,
    EclipsesService,
  ],
})
export class EclipsesModule {}
