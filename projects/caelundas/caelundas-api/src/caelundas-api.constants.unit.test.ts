import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { useWorkingDirectory } from "@codebase/testing";

describe("caelundas api constants", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("emits the GraphQL schema beside the root module whatever the working directory", async () => {
    useWorkingDirectory("/somewhere/else/entirely");

    const { GRAPHQL_SCHEMA_FILE } = await import("./caelundas-api.constants");

    expect(GRAPHQL_SCHEMA_FILE).toBe(
      path.join(import.meta.dirname, "schema.gql"),
    );
  });
});
