import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { MODULE_METADATA } from "@nestjs/common/constants";
import { GRAPHQL_MODULE_OPTIONS } from "@nestjs/graphql";
import { describe, expect, it, vi } from "vitest";

import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { MeanderawApiModule } from "./meanderaw-api.module";

/**
 * Reads the `autoSchemaFile` option a root module hands `GraphQLModule`, by
 * walking its imported dynamic modules for the GraphQL options provider.
 */
function findAutoSchemaFile(rootModule: object): unknown {
  const imports: unknown = Reflect.getMetadata(
    MODULE_METADATA.IMPORTS,
    rootModule,
  );
  if (!Array.isArray(imports)) return undefined;
  for (const imported of imports) {
    if (typeof imported !== "object" || imported === null) continue;
    if (!("providers" in imported) || !Array.isArray(imported.providers)) {
      continue;
    }
    for (const provider of imported.providers) {
      if (
        typeof provider === "object" &&
        provider !== null &&
        "provide" in provider &&
        provider.provide === GRAPHQL_MODULE_OPTIONS &&
        "useValue" in provider &&
        typeof provider.useValue === "object" &&
        provider.useValue !== null &&
        "autoSchemaFile" in provider.useValue
      ) {
        return provider.useValue.autoSchemaFile;
      }
    }
  }
  return undefined;
}

describe("meanderaw api module suite", () => {
  it("instantiates MeanderawApiModule", () => {
    expect.hasAssertions();

    const module = new MeanderawApiModule();

    expect(module).toBeDefined();
  });

  it("connects to the Meanderaw Postgres through MeanderawDatabaseModule", () => {
    expect.hasAssertions();

    const imports: unknown = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      MeanderawApiModule,
    );

    expect(imports).toContain(MeanderawDatabaseModule);
  });

  it("emits the schema beside the module whatever the working directory", async () => {
    expect.hasAssertions();

    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(tmpdir());
    vi.resetModules();
    const { MeanderawApiModule: freshModule } =
      await import("./meanderaw-api.module");
    cwdSpy.mockRestore();

    expect(findAutoSchemaFile(freshModule)).toBe(
      fileURLToPath(new URL("schema.gql", import.meta.url)),
    );
  });
});
