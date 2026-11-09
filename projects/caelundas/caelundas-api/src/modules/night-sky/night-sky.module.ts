import { Module } from "@nestjs/common";

import { NightSkyColorsService } from "./night-sky-colors.service";
import { NightSkyEclipticService } from "./night-sky-ecliptic.service";
import { NightSkyInputService } from "./night-sky-input.service";
import { NightSkyLinesService } from "./night-sky-lines.service";
import { NightSkyOptionsService } from "./night-sky-options.service";
import { NightSkyProjectionService } from "./night-sky-projection.service";
import { NightSkySiderealTimeService } from "./night-sky-sidereal-time.service";
import { NightSkyStarsService } from "./night-sky-stars.service";
import { NightSkySvgService } from "./night-sky-svg.service";
import { NightSkyViewService } from "./night-sky-view.service";
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
