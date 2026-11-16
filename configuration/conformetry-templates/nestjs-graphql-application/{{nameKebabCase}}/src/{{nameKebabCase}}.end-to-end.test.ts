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
          {{nameConstantCase}}_CORS_ORIGINS: " https://app.example.com , ,https://admin.example.com",
        }).{{nameConstantCase}}_CORS_ORIGINS,
      ).toStrictEqual(["https://app.example.com", "https://admin.example.com"]);
    });
  });
});
