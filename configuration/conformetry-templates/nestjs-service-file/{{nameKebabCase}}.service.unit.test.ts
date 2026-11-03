import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/observability/testing";

import { {{namePascalCase}}Service } from "./{{nameKebabCase}}.service";

describe({{namePascalCase}}Service, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule({{namePascalCase}}Service);

    expect(instance).toBeInstanceOf({{namePascalCase}}Service);
  });
});
