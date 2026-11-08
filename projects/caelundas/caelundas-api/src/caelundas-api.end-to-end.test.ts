import { describe, expect, it } from "vitest";

import { environmentSchema } from "./caelundas-api.constants";

describe("caelundas-api end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("applies defaults for an empty config", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({
        CAELUNDAS_API_CORS_ORIGINS: ["*"],
        CAELUNDAS_API_LIGHTSHIP_PORT: 9001,
        CAELUNDAS_API_PORT: 6173,
        CAELUNDAS_POSTGRES_DATABASE: "caelundas_development",
        CAELUNDAS_POSTGRES_HOST: "localhost",
        CAELUNDAS_POSTGRES_PASSWORD: "caelundas_password",
        CAELUNDAS_POSTGRES_PORT: 5432,
        CAELUNDAS_POSTGRES_SCHEMA: "caelundas",
        CAELUNDAS_POSTGRES_USERNAME: "caelundas_username",
      });
    });

    it("splits the configured CORS origins", () => {
      expect.hasAssertions();
      expect(
        environmentSchema.parse({
          CAELUNDAS_API_CORS_ORIGINS: "http://a.test, http://b.test",
        }).CAELUNDAS_API_CORS_ORIGINS,
      ).toStrictEqual(["http://a.test", "http://b.test"]);
    });
  });
});
