import { describe, expect, it } from "vitest";

import { toDeletableFields } from "./lexico-api.utilities";

describe("lexico api utilities suite", () => {
  describe("deletable fields", () => {
    it("copies exactly the shared base columns of a soft-deletable entity", () => {
      expect.hasAssertions();

      const createdAt = new Date("2025-01-01T00:00:00Z");
      const updatedAt = new Date("2025-01-02T00:00:00Z");
      const entity = {
        createdAt,
        createdBy: "creator",
        deletedAt: null,
        deletedBy: null,
        id: "row-1",
        internal: "database only",
        updatedAt,
        updatedBy: null,
      };

      expect(toDeletableFields(entity)).toStrictEqual({
        createdAt,
        createdBy: "creator",
        deletedAt: null,
        deletedBy: null,
        id: "row-1",
        updatedAt,
        updatedBy: null,
      });
    });
  });
});
