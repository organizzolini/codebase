import { Module } from "@nestjs/common";

import { NightSkyService } from "./night-sky.service";

/**
 * Night sky module: holds the star catalog the night sky is drawn from.
 */
@Module({
  controllers: [],
  exports: [NightSkyService],
  imports: [],
  providers: [NightSkyService],
})
export class NightSkyModule {}
