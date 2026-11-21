import { Module } from "@nestjs/common";

import { NightSkyEclipticService } from "./modules/astronomy/night-sky-ecliptic.service";
import { NightSkyProjectionService } from "./modules/astronomy/night-sky-projection.service";
import { NightSkySiderealTimeService } from "./modules/astronomy/night-sky-sidereal-time.service";
import { NightSkyColorsService } from "./modules/drawing/night-sky-colors.service";
import { NightSkyLinesService } from "./modules/drawing/night-sky-lines.service";
import { NightSkyStarsService } from "./modules/drawing/night-sky-stars.service";
import { NightSkySvgService } from "./modules/drawing/night-sky-svg.service";
import { NightSkyViewService } from "./modules/drawing/night-sky-view.service";
import { NightSkyInputService } from "./modules/options/night-sky-input.service";
import { NightSkyOptionsService } from "./modules/options/night-sky-options.service";
import { NightSkyResolver } from "./night-sky.resolver";
import { NightSkyService } from "./night-sky.service";

/**
 * Night sky module: holds the star catalog the night sky is drawn from.
 */
@Module({
  controllers: [],
  exports: [NightSkyService],
  imports: [],
  providers: [
    NightSkyColorsService,
    NightSkyEclipticService,
    NightSkyInputService,
    NightSkyLinesService,
    NightSkyOptionsService,
    NightSkyProjectionService,
    NightSkyResolver,
    NightSkyService,
    NightSkySiderealTimeService,
    NightSkyStarsService,
    NightSkySvgService,
    NightSkyViewService,
  ],
})
export class NightSkyModule {}
