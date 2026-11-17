import { Module } from "@nestjs/common";

import { ProgressiveUtilitiesModule } from "../../../progressive/progressive-utilities.module";
import { AspectsUtilitiesModule } from "../utilities/aspects-utilities.module";

import { StelliumService } from "./stellium.service";

/**
 * NestJS module for stellium configuration detection.
 * Exports {@link StelliumService} which identifies concentrations of 3 or more
 * celestial bodies in close conjunction as maximal cliques of active conjunctions.
 */
@Module({
  controllers: [],
  exports: [StelliumService],
  imports: [AspectsUtilitiesModule, ProgressiveUtilitiesModule],
  providers: [StelliumService],
})
export class StelliumModule {}
