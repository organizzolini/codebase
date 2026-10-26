import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ScannerModule } from "../scanner/scanner.module";

import { CssService } from "./css.service";

describe(CssService, () => {
  let service: CssService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ScannerModule],
      providers: [CssService],
    }).compile();

    service = await module.resolve(CssService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    ["a rule", ".card { color: red; }", ["card", "color", "red"]],
    ["a hyphenated property", "a { font-size: 1rem }", ["a", "font-size"]],
    [
      "a custom property",
      ":root { --accent-color: blue }",
      ["root", "--accent-color", "blue"],
    ],
    [
      "a custom property use",
      "a { color: var(--accent-color) }",
      ["a", "color", "var", "--accent-color"],
    ],
    [
      "a vendor prefix",
      "a { -webkit-box-shadow: none }",
      ["a", "-webkit-box-shadow", "none"],
    ],
    ["an at-rule", "@media screen { a {} }", ["media", "screen", "a"]],
    [
      "a block comment",
      "a { /* hidden words */ color: red }",
      ["a", "color", "red"],
    ],
    ["an unterminated comment", "a /* hidden", ["a"]],
    [
      "a double quoted string",
      'a::before { content: "hidden words" }',
      ["a", "before", "content"],
    ],
    [
      "a single quoted string",
      "a { content: 'hidden words' }",
      ["a", "content"],
    ],
    [
      "an escaped quote",
      String.raw`a { content: "say \"hidden\"" } b`,
      ["a", "content", "b"],
    ],
    ["a quoted attribute value", 'a[href="hidden"] { }', ["a", "href"]],
    [
      "an unterminated string",
      'a { content: "hidden\n} b',
      ["a", "content", "b"],
    ],
    [
      "an unquoted url",
      "a { background: url(images/hidden-path.png) }",
      ["a", "background"],
    ],
    [
      "an unquoted url with spaces",
      "a { background: url( images/hidden.png ) }",
      ["a", "background"],
    ],
    [
      "an uppercase url",
      "a { background: URL(hidden.png) }",
      ["a", "background"],
    ],
    ["an unterminated url", "a { background: url(hidden", ["a", "background"]],
    [
      "a quoted url",
      'a { background: url("hidden.png") }',
      ["a", "background", "url"],
    ],
    ["a name that ends like url", "a { b: curl(1) }", ["a", "b", "curl"]],
    ["a six digit hexadecimal color", "a { color: #abcdef }", ["a", "color"]],
    ["a three digit hexadecimal color", "a { color: #fab }", ["a", "color"]],
    ["a four digit hexadecimal color", "a { color: #fabc }", ["a", "color"]],
    [
      "an eight digit hexadecimal color",
      "a { color: #abcdef12 }",
      ["a", "color"],
    ],
    ["an id selector", "#header { }", ["header"]],
    [
      "an id selector that is longer than a color",
      "#abcdefgh { }",
      ["abcdefgh"],
    ],
    ["a length", "a { margin: -10px 1.5em .5rem }", ["a", "margin"]],
    ["a name with digits", "h1 { }", ["h1"]],
    ["a non-ascii name", ".café { }", ["café"]],
    ["nothing", "", []],
  ])("reads %s", (_name, source, expected) => {
    expect(service.tokenize(source)).toStrictEqual(expected);
  });
});
