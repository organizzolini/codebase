import { describe, expect, it } from "vitest";

import { environmentSchema } from "./caelundas-api.constants";

describe("caelundas-api end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("applies defaults for an empty config", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({
        CAELUNDAS_API_LIGHTSHIP_PORT: 9000,
        CAELUNDAS_API_PORT: 3000,
      });
    });
  });
});
