import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { {{namePascalCase}}Resolver } from "./{{nameKebabCase}}.resolver";

describe({{namePascalCase}}Resolver, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule({{namePascalCase}}Resolver);

    expect(instance).toBeInstanceOf({{namePascalCase}}Resolver);
  });
});
