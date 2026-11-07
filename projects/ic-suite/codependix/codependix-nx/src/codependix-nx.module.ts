import { Module } from "@nestjs/common";

import { BatchModule } from "./modules/batch/batch.module";
import { GateModule } from "./modules/gate/gate.module";
import { PluginModule } from "./modules/plugin/plugin.module";

/**
 * Root module of the plugin's application context.
 *
 * Built once per process and cached — the Nx daemon is long-lived, so paying
 * for a NestJS context on every inference or executor invocation would make
 * this plugin the slowest thing in the graph.
 */
@Module({
  controllers: [],
  exports: [BatchModule, GateModule, PluginModule],
  imports: [BatchModule, GateModule, PluginModule],
  providers: [],
})
export class MainModule {}
