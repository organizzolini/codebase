import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { corsOptions } from "./caelundas-api.utilities";
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
  const webOrigin = "http://localhost:8967";

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
    application.enableCors(corsOptions([webOrigin]));
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

  it("answers the preflight of a cross-origin GraphQL post from an allowed origin", async () => {
    expect.hasAssertions();

    const response = await fetch(url, {
      headers: {
        "access-control-request-headers":
          "apollo-require-preflight,content-type",
        "access-control-request-method": "POST",
        origin: webOrigin,
      },
      method: "OPTIONS",
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(webOrigin);
    expect(response.headers.get("access-control-allow-methods")).toContain(
      "POST",
    );
    expect(response.headers.get("access-control-allow-headers")).toBe(
      "apollo-require-preflight,content-type",
    );
  });

  it("answers a cross-origin query from an allowed origin with the origin echoed", async () => {
    expect.hasAssertions();

    const response = await fetch(url, {
      body: JSON.stringify({ query: "{ health }" }),
      headers: { "content-type": "application/json", origin: webOrigin },
      method: "POST",
    });

    expect(response.headers.get("access-control-allow-origin")).toBe(webOrigin);
    expect(healthResponseSchema.parse(await response.json())).toStrictEqual({
      data: { health: true },
    });
  });

  it("withholds the cross-origin headers from an origin that is not allowed", async () => {
    expect.hasAssertions();

    const response = await fetch(url, {
      headers: {
        "access-control-request-method": "POST",
        origin: "http://evil.example",
      },
      method: "OPTIONS",
    });

    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});
