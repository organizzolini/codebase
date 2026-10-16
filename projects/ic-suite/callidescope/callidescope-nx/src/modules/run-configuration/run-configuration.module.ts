import { ConfigurationModule } from "@callidescope/configuration";
import { Module } from "@nestjs/common";

import { RunConfigurationService } from "./run-configuration.service";

/** Provides the configuration lookup every run of this plugin starts from. */
@Module({
  controllers: [],
  exports: [RunConfigurationService],
  imports: [ConfigurationModule],
  providers: [RunConfigurationService],
})
export class RunConfigurationModule {}
