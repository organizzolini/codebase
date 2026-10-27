import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./caelundas-cli.constants";
import { EventsDatabaseModule } from "./modules/events-database/events-database.module";

/**
 * The root of the events database application: the build command and nothing
 * that connects to the ingestion database, which it only reads as a file.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    DiscoveryModule,
    LoggerModule,
    EventsDatabaseModule,
  ],
})
export class EventsDatabaseCliModule {}
