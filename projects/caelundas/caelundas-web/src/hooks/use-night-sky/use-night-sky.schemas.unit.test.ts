import { describe, expect, it } from "vitest";

import catalog from "./use-night-sky.catalog.json";
import { starCatalogSchema } from "./use-night-sky.schemas";

describe("starCatalogSchema", () => {
  it("accepts the committed catalog, brightest first", () => {
    const stars = starCatalogSchema.parse(catalog);
    const magnitudes = stars.map((star) => star[2]);

    expect(stars[0]).toStrictEqual([6.7525, -16.716, -1.4, 0.01]);
    expect(magnitudes).toStrictEqual(magnitudes.toSorted((a, b) => a - b));
  });

  it("rejects a row with a missing field or a wrong type", () => {
    expect(starCatalogSchema.safeParse([[6.7525, -16.716, -1.4]]).success).toBe(
      false,
    );
    expect(
      starCatalogSchema.safeParse([[6.7525, "x", -1.4, 0.01]]).success,
    ).toBe(false);
  });
});
