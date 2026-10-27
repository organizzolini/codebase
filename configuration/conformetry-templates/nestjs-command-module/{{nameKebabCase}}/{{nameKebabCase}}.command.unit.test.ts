import { describe, expect, it } from "vitest";

import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { {{namePascalCase}}Command } from "./{{nameKebabCase}}.command";

describe({{namePascalCase}}Command, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule({{namePascalCase}}Command);

    expect(instance).toBeInstanceOf({{namePascalCase}}Command);
  });

  it("sets logger context", async () => {
    await expectLoggerContext({{namePascalCase}}Command);
  });
});
