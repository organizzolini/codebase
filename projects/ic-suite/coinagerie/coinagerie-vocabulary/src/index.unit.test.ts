import { describe, expect, it } from "vitest";

import * as vocabulary from "./index";

describe("coinagerie-vocabulary index", () => {
  it("exports the vocabulary modules and their services", () => {
    expect(Object.keys(vocabulary).toSorted()).toStrictEqual(
      [
        "DiscoveryModule",
        "DiscoveryService",
        "FoldingModule",
        "FoldingService",
        "VocabularyModule",
        "VocabularyService",
        "WordsModule",
        "WordsService",
      ].toSorted(),
    );
  });
});
