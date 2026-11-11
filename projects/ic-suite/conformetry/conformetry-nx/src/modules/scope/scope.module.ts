import { ConfigurationModule } from "@conformetry/configuration";
import { Module } from "@nestjs/common";

import { ScopeService } from "./scope.service";

/**
 * Reads and matches a generator's project scope.
 *
 * Depends only on the dependency-free `ConfigurationModule`, so it stays usable from the graph, a generator, and the install-time bootstrap alike.
 */
@Module({
  controllers: [],
  exports: [ScopeService],
  imports: [ConfigurationModule],
  providers: [ScopeService],
})
export class ScopeModule {}
