import { Module } from "@nestjs/common";

import { ConfigurationService } from "./configuration.service";

/**
 * Provides the configuration layer: reading a `coinagerie.config.ts` into a
 * configuration every other coinagerie package can trust.
 */
@Module({
  controllers: [],
  exports: [ConfigurationService],
  imports: [],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}
