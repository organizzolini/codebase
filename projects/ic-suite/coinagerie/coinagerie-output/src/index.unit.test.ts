import { describe, expect, it } from "vitest";

import * as output from "./index";

describe("coinagerie-output index", () => {
  it("exports the output modules and their services", () => {
    expect(Object.keys(output).toSorted()).toStrictEqual(
      [
        "ComparisonModule",
        "ComparisonService",
        "DeliveryModule",
        "DeliveryService",
        "MarkdownModule",
        "MarkdownService",
      ].toSorted(),
    );
  });
});
