import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";

import { LoggerModule } from "@codebase/observability";

import {
  environmentSchema,
  GRAPHQL_SCHEMA_FILE,
} from "./caelundas-api.constants";
import { HealthModule } from "./modules/health/health.module";

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
    LoggerModule,
    HealthModule,
  ],
})
export class CaelundasApiModule {}
