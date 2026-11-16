import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { z } from "zod";

import {
  MEANDERAW_DATABASE_ENTITIES,
  MEANDERAW_DATABASE_MIGRATIONS,
  MEANDERAW_PROJECT,
  MeanderawDatabaseAggregatesService,
  MeanderawDatabaseModule,
  MeanderawDatabaseService,
} from "@codebase/meanderaw-db";
import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import { CorsService } from "../src/cors.service";
import { environmentSchema } from "../src/meanderaw-api.constants";

import type {
  CharacteristicRecord,
  MeanderRecord,
} from "@codebase/meanderaw-db";
import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { INestApplication, Type } from "@nestjs/common";
import type { Server } from "node:http";

/** Starting Postgres and running the migrations takes longer than a test. */
export const DATABASE_TIMEOUT_MILLISECONDS = 120_000;

/** Validates the body of a GraphQL response. */
const graphqlResponseSchema = z.object({
  data: z.record(z.string(), z.unknown()).nullish(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

/** The body of a GraphQL response: data, errors, or both. */
export type GraphqlResponse = z.infer<typeof graphqlResponseSchema>;

/** The API served over HTTP from a migrated test database. */
export interface MeanderawApplication {
  readonly database: DatabaseTestingModule;
  readonly endpoint: string;
  readonly query: (
    document: string,
    variables?: Record<string, unknown>,
  ) => Promise<GraphqlResponse>;
  readonly stop: () => Promise<void>;
}

/**
 * Seeds the catalog and meanders, then rebuilds the aggregate tables, so the
 * database reads as it does after a draw run.
 */
export async function seedMeanderaw(
  database: DatabaseTestingModule,
  catalog: readonly CharacteristicRecord[],
  meanders: readonly MeanderRecord[],
): Promise<void> {
  const service = database.module.get(MeanderawDatabaseService);

  await service.syncCharacteristics(catalog);
  await service.saveAll(meanders);
  await database.module.get(MeanderawDatabaseAggregatesService).rebuild();
}

/**
 * Serves `modules` over Apollo and Express, against a migrated Postgres
 * container on an ephemeral port, with CORS for `origins` when given. Nothing
 * is seeded: call {@link seedMeanderaw}.
 */
export async function startMeanderawApplication(
  modules: readonly Type<unknown>[],
  origins?: string[],
): Promise<MeanderawApplication> {
  const database = await startDatabaseTestingModule({
    database: MeanderawDatabaseModule,
    entities: [...MEANDERAW_DATABASE_ENTITIES],
    imports: [
      GraphQLModule.forRoot<ApolloDriverConfig>({
        autoSchemaFile: true,
        driver: ApolloDriver,
        playground: false,
      }),
      ...modules,
    ],
    migrations: [...MEANDERAW_DATABASE_MIGRATIONS],
    project: MEANDERAW_PROJECT,
    validate: (config) => environmentSchema.parse(config),
  });

  try {
    const application =
      database.module.createNestApplication<INestApplication<Server>>();

    if (origins !== undefined) {
      application.enableCors(new CorsService().getOptions(origins));
    }

    await application.listen(0, "127.0.0.1");
    const endpoint = `${await application.getUrl()}/graphql`;

    return {
      database,
      endpoint,
      query: async (document, variables): Promise<GraphqlResponse> => {
        const response = await fetch(endpoint, {
          body: JSON.stringify({ query: document, variables }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        return graphqlResponseSchema.parse(await response.json());
      },
      stop: async (): Promise<void> => {
        await application.close();
        await database.close();
      },
    };
  } catch (error) {
    await database.close();
    throw error;
  }
}
