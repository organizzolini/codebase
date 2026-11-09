import { Module } from "@nestjs/common";

import { InputModule } from "../input/input.module";
import { InstanceDiscoveryModule } from "../instance-discovery/instance-discovery.module";
import { InstanceGroupModule } from "../instance-group/instance-group.module";
import { RenderingModule } from "../rendering/rendering.module";
import { TemplateDiscoveryModule } from "../template-discovery/template-discovery.module";

import { ConfigurationService } from "./configuration.service";

/**
 * Provides the configuration layer's one public service.
 *
 * Only `ConfigurationService` is exported; a consumer injects it and nothing else from this package.
 */
@Module({
  controllers: [],
  exports: [ConfigurationService],
  imports: [
    InputModule,
    InstanceDiscoveryModule,
    InstanceGroupModule,
    RenderingModule,
    TemplateDiscoveryModule,
  ],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}
