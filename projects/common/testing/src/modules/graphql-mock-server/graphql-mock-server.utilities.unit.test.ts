import { graphql, HttpResponse } from "msw";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { graphqlMockServer } from "./graphql-mock-server.constants";
import {
  resetGraphqlMockServer,
  startGraphqlMockServer,
  stopGraphqlMockServer,
} from "./graphql-mock-server.utilities";

// 🧪 Tests

const ENDPOINT = "https://api.example.com/graphql";

/** Posts a GraphQL query, resolving with the response's status and body text. */
async function query(name: string): Promise<{ body: string; status: number }> {
  const response = await fetch(ENDPOINT, {
    body: JSON.stringify({ query: `query ${name} { greeting }` }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  return { body: await response.text(), status: response.status };
}

describe("the GraphQL mock server", () => {
  beforeAll(() => {
    startGraphqlMockServer();
  });

  afterAll(() => {
    stopGraphqlMockServer();
  });

  it("answers a query with the handler a test added", async () => {
    graphqlMockServer.use(
      graphql.query("Greeting", () =>
        HttpResponse.json({ data: { greeting: "salve" } }),
      ),
    );

    await expect(query("Greeting")).resolves.toStrictEqual({
      body: JSON.stringify({ data: { greeting: "salve" } }),
      status: 200,
    });
  });

  it("forgets a test's handlers once reset, so the request goes unhandled", async () => {
    graphqlMockServer.use(
      graphql.query("Greeting", () =>
        HttpResponse.json({ data: { greeting: "salve" } }),
      ),
    );
    resetGraphqlMockServer();

    await expect(query("Greeting")).rejects.toThrow(/Cannot bypass a request/u);
  });

  it("fails a request no handler answers", async () => {
    await expect(query("Unhandled")).rejects.toThrow(
      /Cannot bypass a request/u,
    );
  });
});
