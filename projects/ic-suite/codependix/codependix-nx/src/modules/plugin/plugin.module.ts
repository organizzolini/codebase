import { ConfigurationModule } from "@codependix/configuration";
import { Module } from "@nestjs/common";

import { PluginService } from "./plugin.service";

/** Provides target inference for the plugin's `createNodes`. */
@Module({
  controllers: [],
  exports: [PluginService],
  imports: [ConfigurationModule],
  providers: [PluginService],
})
export class PluginModule {}
