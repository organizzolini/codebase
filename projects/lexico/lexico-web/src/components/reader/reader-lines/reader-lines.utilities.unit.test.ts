import { describe, expect, it } from "vitest";

import { describeOrigin } from "./reader-lines.utilities";

import type { ReaderText } from "./reader-lines.types";

describe(describeOrigin, () => {
  const book = {
    parentText: { slug: "vergil-aeneid", title: "Aeneid" },
    title: "Book 1",
  } as ReaderText;

  it("names the parent work before the text", () => {
    expect(describeOrigin(book)).toBe("Aeneid, Book 1");
  });

  it("names a text without a parent by its own title", () => {
    expect(describeOrigin({ ...book, parentText: null })).toBe("Book 1");
  });
});
