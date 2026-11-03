import ts from "typescript";
import { describe, expect, it } from "vitest";

import { TYPESCRIPT_KEYWORDS as typescriptKeywords } from "./typescript.constants";

/** Every keyword the compiler's scanner recognizes, reserved or contextual. */
function scannerKeywords(): string[] {
  const count = ts.SyntaxKind.LastKeyword - ts.SyntaxKind.FirstKeyword + 1;

  return Array.from({ length: count }, (_value, offset) =>
    ts.tokenToString(ts.SyntaxKind.FirstKeyword + offset),
  ).filter((text): text is string => text !== undefined);
}

describe("typescriptKeywords", () => {
  it("is a plain array of strings", () => {
    expect(Array.isArray(typescriptKeywords)).toBe(true);
    expect(typescriptKeywords.every((word) => typeof word === "string")).toBe(
      true,
    );
  });

  it.each([
    ["a reserved word", "class"],
    ["a strict-mode reserved word", "implements"],
    ["a contextual keyword", "readonly"],
    ["a type keyword", "unknown"],
    ["a word usable as a property name", "default"],
  ])("holds %s", (_case, word) => {
    expect(typescriptKeywords).toContain(word);
  });

  it("holds exactly the keywords the compiler's scanner knows", () => {
    expect(typescriptKeywords.toSorted()).toStrictEqual(
      scannerKeywords().toSorted(),
    );
  });

  it("holds each keyword once, lowercase, and sorted", () => {
    expect(typescriptKeywords).toStrictEqual(
      [...new Set(typescriptKeywords)].toSorted(),
    );
    expect(typescriptKeywords).toStrictEqual(
      typescriptKeywords.map((word) => word.toLowerCase()),
    );
  });
});
