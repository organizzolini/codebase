import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import compression from "compression";

import { CaelundasDatabaseModule } from "@codebase/caelundas-db";
import { LoggerModule } from "@codebase/observability";

import {
  environmentSchema,
  GRAPHQL_SCHEMA_FILE,
} from "./caelundas-api.constants";
import { HealthModule } from "./modules/health/health.module";
import { NightSkyModule } from "./modules/night-sky/night-sky.module";

import type { MiddlewareConsumer, NestModule } from "@nestjs/common";

/**
 * Root NestJS application module for the CaelundasApi GraphQL API.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: GRAPHQL_SCHEMA_FILE,
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    CaelundasDatabaseModule,
    LoggerModule,
    HealthModule,
    NightSkyModule,
  ],
})
export class CaelundasApiModule implements NestModule {
  /**
   * Compresses what the GraphQL endpoint answers, for a client that accepts
   * it, since a night sky is a large SVG.
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(compression()).forRoutes("graphql");
  }
}
