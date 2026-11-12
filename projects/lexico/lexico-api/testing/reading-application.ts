import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { z } from "zod";

import {
  AdjectivalForm,
  AdjectiveInflection,
  AdverbForm,
  AdverbInflection,
  Author,
  FiniteVerbForm,
  GerundForm,
  InfinitiveForm,
  LexicoDatabaseModule,
  Line,
  NominalForm,
  NounInflection,
  ParticipleForm,
  PrepositionInflection,
  SupineForm,
  Text,
  Token,
  UninflectedInflection,
  VerbInflection,
  Word,
} from "@codebase/lexico-db";

import { environmentSchema } from "../src/lexico-api.constants";
import { LiteratureModule } from "../src/modules/literature/literature.module";

import { startLexicoDatabaseTestingModule } from "./database";
import { type ReadingPassage, seedReadingPassage } from "./reading-passage";

import type { DynamicModule, INestApplication } from "@nestjs/common";
import type { Server } from "node:http";

/** Validates the body of a GraphQL response. */
const readingResponseSchema = z.object({
  data: z.record(z.string(), z.unknown()).nullish(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

/** The literature API served over HTTP from the seeded reading passage. */
export interface ReadingApplication {
  readonly close: () => Promise<void>;
  readonly execute: (
    document: string,
    variables?: Record<string, unknown>,
  ) => Promise<ReadingResponse>;
  readonly passage: ReadingPassage;
  readonly server: INestApplication<Server>;
}

/** The body of a GraphQL response: data, errors, or both. */
export type ReadingResponse = z.infer<typeof readingResponseSchema>;

/** The root the literature module is mounted under. */
@Module({})
class ReadingApplicationModule {}

/**
 * Seeds the reading passage into a fresh database and serves the literature module on an ephemeral port. Closes the database on failure.
 */
export async function startReadingApplication(): Promise<ReadingApplication> {
  const database = await startLexicoDatabaseTestingModule([
    Author,
    Line,
    Text,
    Token,
    Word,
  ]);
  try {
    const passage = await seedReadingPassage(database.dataSource);
    const server = await NestFactory.create<INestApplication<Server>>(
      readingApplicationModule(),
      { logger: false },
    );
    await server.listen(0, "127.0.0.1");
    const endpoint = `${await server.getUrl()}/graphql`;

    return {
      close: async (): Promise<void> => {
        await server.close();
        await database.close();
      },
      execute: async (document, variables = {}): Promise<ReadingResponse> => {
        const response = await fetch(endpoint, {
          body: JSON.stringify({ query: document, variables }),
          headers: { "content-type": "application/json" },
          method: "POST",
        });
        return readingResponseSchema.parse(await response.json());
      },
      passage,
      server,
    };
  } catch (error) {
    // 🧹 A failed seed or boot would otherwise leave the container running.
    await database.close();
    throw error;
  }
}

/**
 * Built on call: `ConfigModule.forRoot` validates the environment on run, before the database login is stubbed.
 */
function readingApplicationModule(): DynamicModule {
  return {
    imports: [
      ConfigModule.forRoot({
        ignoreEnvFile: true,
        isGlobal: true,
        validate: (config: Record<string, unknown>) =>
          environmentSchema.parse(config),
      }),
      GraphQLModule.forRoot<ApolloDriverConfig>({
        autoSchemaFile: true,
        buildSchemaOptions: {
          orphanedTypes: [
            NominalForm,
            FiniteVerbForm,
            ParticipleForm,
            AdverbForm,
            InfinitiveForm,
            GerundForm,
            SupineForm,
            AdjectivalForm,
            NounInflection,
            VerbInflection,
            AdjectiveInflection,
            AdverbInflection,
            PrepositionInflection,
            UninflectedInflection,
          ],
        },
        driver: ApolloDriver,
        playground: false,
      }),
      LexicoDatabaseModule,
      LiteratureModule,
    ],
    module: ReadingApplicationModule,
  };
}
