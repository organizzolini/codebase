import { describe, expect, it } from "vitest";

import { environmentSchema } from "./meanderaw-api.constants";

describe("meanderaw-api end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("applies defaults for an empty config", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toMatchObject({
        MEANDERAW_API_CORS_ORIGINS: ["*"],
        MEANDERAW_API_LIGHTSHIP_PORT: 9002,
        MEANDERAW_API_PORT: 8367,
      });
    });

    it("splits the configured CORS origins", () => {
      expect.hasAssertions();
      expect(
        environmentSchema.parse({
          MEANDERAW_API_CORS_ORIGINS: "http://a.test, http://b.test,, ",
        }).MEANDERAW_API_CORS_ORIGINS,
      ).toStrictEqual(["http://a.test", "http://b.test"]);
    });
  });
});
