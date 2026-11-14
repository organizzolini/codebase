import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";

import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";
import { LoggerModule } from "@codebase/observability";

import {
  environmentSchema,
  GRAPHQL_SCHEMA_FILE,
} from "./meanderaw-api.constants";
import { CharacteristicsModule } from "./modules/characteristics/characteristics.module";
import { MeanderGroupsModule } from "./modules/meander-groups/meander-groups.module";
import { MeandersModule } from "./modules/meanders/meanders.module";

/**
 * Root NestJS application module for the MeanderawApi GraphQL API.
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
    MeanderawDatabaseModule,
    LoggerModule,
    CharacteristicsModule,
    MeandersModule,
    MeanderGroupsModule,
  ],
})
export class MeanderawApiModule {}
