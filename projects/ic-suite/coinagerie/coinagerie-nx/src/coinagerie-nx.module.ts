import { Module } from "@nestjs/common";

/**
 * Root module of the plugin's application context.
 *
 * Built once per process and cached — the Nx daemon is long-lived, so paying
 * for a NestJS context on every inference would make this plugin the slowest
 * thing in the graph.
 */
@Module({
  controllers: [],
  exports: [],
  imports: [],
  providers: [],
})
export class MainModule {}
