import { ConfigurationModule } from "@codometer/configuration";
import { LanguagesModule } from "@codometer/languages";
import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { CustomizationModule } from "../customization/customization.module";
import { DiscoveryModule } from "../discovery/discovery.module";
import { InputsModule } from "../inputs/inputs.module";
import { LimitsModule } from "../limits/limits.module";
import { SizeModule } from "../size/size.module";

import { MeasureService } from "./measure.service";

/**
 * Wires every analyzer a measurement run joins, and the service that joins them.
 *
 * Discovery, language, size, custom counters, and limits; none imports another, so the join lives here.
 */
@Module({
  controllers: [],
  exports: [MeasureService],
  imports: [
    ConfigurationModule,
    CustomizationModule,
    DiscoveryModule,
    InputsModule,
    LanguagesModule,
    LimitsModule,
    LoggerModule,
    SizeModule,
  ],
  providers: [MeasureService],
})
export class MeasureModule {}
