import { Module } from "@nestjs/common";

import { EphemerisModule } from "../../../ephemeris/ephemeris.module";
import { BoundarySearchModule } from "../../../ephemeris/modules/boundary-search/boundary-search.module";

import { IngressStaysService } from "./ingress-stays.service";
import { IngressesComposerService } from "./ingresses-composer.service";
import { IngressesService } from "./ingresses.service";
import { SignTransitsService } from "./sign-transits.service";

/**
 * NestJS module for zodiacal ingress event detection.
 * Exports {@link IngressesService} which identifies when celestial bodies enter new
 * zodiac signs, decans, or reach their sign peak longitude, and the stays between.
 */
@Module({
  controllers: [],
  exports: [IngressesService],
  imports: [BoundarySearchModule, EphemerisModule],
  providers: [
    IngressesComposerService,
    IngressesService,
    IngressStaysService,
    SignTransitsService,
  ],
})
export class IngressesModule {}
