import { describe, expect, it } from "vitest";

import * as languages from "./index";

describe("coinagerie-languages index", () => {
  it("exports the language modules, their services, and their keyword lists", () => {
    expect(Object.keys(languages).toSorted()).toStrictEqual(
      [
        "CssModule",
        "CssService",
        "cssKeywords",
        "HclModule",
        "HclService",
        "hclKeywords",
        "JsonModule",
        "JsonService",
        "jsonKeywords",
        "LanguagesModule",
        "LanguagesService",
        "PythonModule",
        "PythonService",
        "pythonKeywords",
        "ShellModule",
        "ShellService",
        "shellKeywords",
        "SqlModule",
        "SqlService",
        "sqlKeywords",
        "TomlModule",
        "TomlService",
        "tomlKeywords",
        "TypescriptModule",
        "TypescriptService",
        "typescriptKeywords",
        "YamlModule",
        "YamlService",
        "yamlKeywords",
      ].toSorted(),
    );
  });

  describe("keyword lists", () => {
    const lists = {
      cssKeywords: [languages.cssKeywords, "media", "inherit"],
      hclKeywords: [languages.hclKeywords, "for", "endif"],
      jsonKeywords: [languages.jsonKeywords, "null", "true"],
      pythonKeywords: [languages.pythonKeywords, "lambda", "none"],
      shellKeywords: [languages.shellKeywords, "esac", "export"],
      sqlKeywords: [languages.sqlKeywords, "select", "where"],
      tomlKeywords: [languages.tomlKeywords, "inf", "nan"],
      typescriptKeywords: [
        languages.typescriptKeywords,
        "interface",
        "readonly",
      ],
      yamlKeywords: [languages.yamlKeywords, "false", "null"],
    } as const;

    it.each(Object.entries(lists))(
      "%s is a plain array of its language's words",
      (_name, [keywords, first, second]) => {
        expect(Array.isArray(keywords)).toBe(true);
        expect(keywords).toContain(first);
        expect(keywords).toContain(second);
      },
    );

    it.each(Object.entries(lists))(
      "%s holds unique lowercase words, sorted",
      (_name, [keywords]) => {
        expect(keywords.length).toBeGreaterThan(0);
        expect(new Set(keywords).size).toBe(keywords.length);
        expect(keywords.every((keyword) => /^[\p{Ll}]+$/u.test(keyword))).toBe(
          true,
        );
        expect([...keywords].toSorted()).toStrictEqual([...keywords]);
      },
    );

    it("keeps ordinary words out of every list", () => {
      const everyKeyword = new Set(
        Object.values(lists).flatMap(([list]) => list),
      );

      expect(everyKeyword.has("configuration")).toBe(false);
      expect(everyKeyword.has("glossary")).toBe(false);
    });
  });
});
