import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { HealthModule } from "./modules/health/health.module";

import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";

/** Validates the body of a GraphQL response to the health query. */
const healthResponseSchema = z.object({
  data: z.object({ health: z.boolean() }),
});

describe("caelundas api graphql end-to-end suite", () => {
  let application: INestApplication<Server>;
  let url: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          autoSchemaFile: true,
          driver: ApolloDriver,
          playground: false,
        }),
        HealthModule,
      ],
    }).compile();

    application = module.createNestApplication<INestApplication<Server>>();
    await application.listen(0);
    url = `${await application.getUrl()}/graphql`;
  });

  afterAll(async () => {
    await application.close();
  });

  it("answers the health query with true", async () => {
    expect.hasAssertions();

    const response = await fetch(url, {
      body: JSON.stringify({ query: "{ health }" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(healthResponseSchema.parse(await response.json())).toStrictEqual({
      data: { health: true },
    });
  });
});
