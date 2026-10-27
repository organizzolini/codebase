import { describe, expect, it } from "vitest";

import * as languages from "./index";

describe("coinagerie-languages index", () => {
  it("exports the language modules and their services", () => {
    expect(Object.keys(languages).toSorted()).toStrictEqual(
      [
        "LanguagesModule",
        "LanguagesService",
        "TypescriptModule",
        "TypescriptService",
        "typescriptKeywords",
      ].toSorted(),
    );
  });
});
