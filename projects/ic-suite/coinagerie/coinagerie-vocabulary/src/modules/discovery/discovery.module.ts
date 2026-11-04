import { Module } from "@nestjs/common";

import { DiscoveryService } from "./discovery.service";
import { IgnoreRulesService } from "./ignore-rules.service";

/**
 * Provides file discovery. `IgnoreRulesService` is a provider rather than an
 * export: it is how discovery reads `.gitignore`, and nothing else needs it.
 */
@Module({
  controllers: [],
  exports: [DiscoveryService],
  imports: [],
  providers: [DiscoveryService, IgnoreRulesService],
})
export class DiscoveryModule {}
