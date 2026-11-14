import { describe, expect, it } from "vitest";

import { environmentSchema } from "./meanderaw-api.constants";

describe("meanderaw-api end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("applies defaults for an empty config", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toMatchObject({
        MEANDERAW_API_LIGHTSHIP_PORT: 9002,
        MEANDERAW_API_PORT: 2162,
      });
    });
  });
});
