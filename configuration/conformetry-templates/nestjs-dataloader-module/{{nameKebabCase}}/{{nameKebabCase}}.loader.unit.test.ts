import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { {{namePascalCase}}Loader } from "./{{nameKebabCase}}.loader";
import { {{namePascalCase}}Service } from "./{{nameKebabCase}}.service";

describe({{namePascalCase}}Loader, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule({{namePascalCase}}Loader, {
      mocks: [{{namePascalCase}}Service],
    });

    expect(instance).toBeInstanceOf({{namePascalCase}}Loader);
  });
});
