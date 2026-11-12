import { ConfigurationModule as CodometerConfigurationModule } from "@codometer/configuration";
import { DiscoveryModule } from "@codometer/measurement";
import { Module } from "@nestjs/common";

import { ConfigurationListingService } from "./configuration-listing.service";
import { RenderConfigurationService } from "./render-configuration.service";

/**
 * Renders what a repository configures, as a document rather than a command.
 *
 * Reads the configuration a tree declares and renders it as markdown or JSON. Codometer's configuration and discovery modules are imported, so the listing resolves files exactly as a measurement would.
 */
@Module({
  controllers: [],
  exports: [ConfigurationListingService, RenderConfigurationService],
  imports: [CodometerConfigurationModule, DiscoveryModule],
  providers: [ConfigurationListingService, RenderConfigurationService],
})
export class ConfigurationListingModule {}
