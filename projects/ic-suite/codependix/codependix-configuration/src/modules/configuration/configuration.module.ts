import { Module } from "@nestjs/common";

import { InputModule } from "../input/input.module";
import { OverrideResolutionModule } from "../override-resolution/override-resolution.module";

import { ConfigurationLoaderService } from "./configuration-loader.service";
import { ConfigurationService } from "./configuration.service";
import { FlagResolutionService } from "./flag-resolution.service";

/**
 * Provides everything one run is configured by: the configuration file, the command line over it,
 * and each project's own output. `ConfigurationService` is the only export; the rest are providers,
 * so one place answers what a run does.
 */
@Module({
  controllers: [],
  exports: [ConfigurationService],
  imports: [InputModule, OverrideResolutionModule],
  providers: [
    ConfigurationLoaderService,
    ConfigurationService,
    FlagResolutionService,
  ],
})
export class ConfigurationModule {}
