import { Module } from "@nestjs/common";

import { OptionsModule } from "../options/options.module";

import { PluginService } from "./plugin.service";

/** Provides target inference. */
@Module({
  controllers: [],
  exports: [PluginService],
  imports: [OptionsModule],
  providers: [PluginService],
})
export class PluginModule {}
