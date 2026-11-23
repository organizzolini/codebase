import { describe, expect, it } from "vitest";

import { getGraphEdgeMetadata } from "@codebase/persistence";

import { ConstellationLine } from "./constellation-line.entity";

describe(ConstellationLine, () => {
  it("reads an undirected graph whose edges join stars and carry the designation as label", () => {
    expect(getGraphEdgeMetadata(ConstellationLine)).toStrictEqual({
      directed: false,
      kind: "graph",
      labelColumn: "constellationDesignation",
      sourceColumn: "fromHip",
      targetColumn: "toHip",
    });
  });
});
