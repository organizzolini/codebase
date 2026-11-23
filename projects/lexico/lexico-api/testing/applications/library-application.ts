import { NestFactory } from "@nestjs/core";
import { z } from "zod";

import { Author, Line, Text } from "@codebase/lexico-db";

import { startLexicoDatabaseTestingModule } from "../database";
import { seedLibraryCatalog } from "../fixtures/library-catalog";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";

/** The whole Lexico API, served over HTTP from the seeded library catalog. */
export interface LibraryApplication {
  readonly database: DatabaseTestingModule;
  readonly execute: (
    document: string,
    variables?: Record<string, unknown>,
  ) => Promise<LibraryResponse>;
  readonly stop: () => Promise<void>;
}

/** Validates a GraphQL response body: data when execution succeeded, errors when not. */
const libraryResponseSchema = z.object({
  data: z.record(z.string(), z.unknown()).nullish(),
  errors: z
    .array(
      z.object({ extensions: z.unknown().optional(), message: z.string() }),
    )
    .optional(),
});

/** A GraphQL response body: data when execution succeeded, errors when not. */
export type LibraryResponse = z.infer<typeof libraryResponseSchema>;

/**
 * Seeds the library catalog into a fresh database and boots the Lexico API on an ephemeral port. Stops the database if either fails.
 */
export async function startLibraryApplication(): Promise<LibraryApplication> {
  const database = await startLexicoDatabaseTestingModule([Author, Line, Text]);
  try {
    await seedLibraryCatalog(database);

    // ⏳ ConfigModule reads the environment when the module is imported, so the
    // root module is imported only once the database's login is stubbed.
    const { LexicoApiModule } = await import("../../src/lexico-api.module");
    const application = await NestFactory.create<INestApplication<Server>>(
      LexicoApiModule,
      { logger: false },
    );
    await application.listen(0, "127.0.0.1");
    const endpoint = `${await application.getUrl()}/graphql`;

    return {
      database,
      execute: async (
        document: string,
        variables: Record<string, unknown> = {},
      ): Promise<LibraryResponse> => {
        const response = await fetch(endpoint, {
          body: JSON.stringify({ query: document, variables }),
          headers: { "content-type": "application/json" },
          method: "POST",
        });
        return libraryResponseSchema.parse(await response.json());
      },
      stop: async (): Promise<void> => {
        await application.close();
        await database.close();
      },
    };
  } catch (error) {
    // 🧹 A failed seed or boot would otherwise leave the container running.
    await database.close();
    throw error;
  }
}
