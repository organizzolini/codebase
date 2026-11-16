import { describe, expect, it } from "vitest";

import { environmentSchema } from "./{{nameKebabCase}}.constants";

describe("{{nameKebabCase}} end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("applies defaults for an empty config", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({
        {{nameConstantCase}}_CORS_ORIGINS: ["*"],
        {{nameConstantCase}}_LIGHTSHIP_PORT: 9000,
        {{nameConstantCase}}_PORT: 3000,
      });
    });

    it("splits and trims the listed CORS origins", () => {
      expect.hasAssertions();
      expect(
        environmentSchema.parse({
          {{nameConstantCase}}_CORS_ORIGINS: " http://localhost:3000 , ,http://127.0.0.1:3000",
        }).{{nameConstantCase}}_CORS_ORIGINS,
      ).toStrictEqual(["http://localhost:3000", "http://127.0.0.1:3000"]);
    });
  });
});
