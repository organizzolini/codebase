import { describe, expect, it } from "vitest";

import { resolveTagPaths, tagNodeKey } from "./tags.utilities";

describe("tags utilities", () => {
  describe(resolveTagPaths, () => {
    it("falls back to a root named for the raw tag", () => {
      expect(resolveTagPaths("moon")).toStrictEqual([["moon"]]);
    });
  });

  describe(tagNodeKey, () => {
    it("tells a root from a child of the same name", () => {
      expect(tagNodeKey(null, "Mars")).not.toBe(tagNodeKey("parent", "Mars"));
    });

    it("tells apart children of different parents", () => {
      expect(tagNodeKey("planet", "Mars")).not.toBe(tagNodeKey("sign", "Mars"));
    });
  });
});
