import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { {{namePascalCase}}Resolver } from "./{{nameKebabCase}}.resolver";
import { {{namePascalCase}}Service } from "./{{nameKebabCase}}.service";

describe({{namePascalCase}}Resolver, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule({{namePascalCase}}Resolver, {
      providers: [{{namePascalCase}}Service],
    });

    expect(instance).toBeInstanceOf({{namePascalCase}}Resolver);
  });
});
