import { Module } from "@nestjs/common";

import { NightSkyResolver } from "./night-sky.resolver";
import { NightSkyService } from "./night-sky.service";

/**
 * Night sky module: holds the star catalog the night sky is drawn from.
 */
@Module({
  controllers: [],
  exports: [NightSkyService],
  imports: [],
  providers: [NightSkyResolver, NightSkyService],
})
export class NightSkyModule {}
