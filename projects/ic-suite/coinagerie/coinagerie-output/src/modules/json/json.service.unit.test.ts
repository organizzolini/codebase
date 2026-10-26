import { MalformedGlossaryError } from "@coinagerie/core";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { JsonService } from "./json.service";

const PATH = "/fixture/glossary.json";

describe(JsonService, () => {
  let service: JsonService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [JsonService],
    }).compile();

    service = await module.resolve(JsonService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("render", () => {
    it.each<[string, [string, string][], string]>([
      ["an empty glossary", [], "{}\n"],
      [
        "an undefined word as an empty string",
        [["aspect", ""]],
        '{\n  "aspect": ""\n}\n',
      ],
      [
        "words sorted whatever order they arrive in",
        [
          ["phase", "Second."],
          ["angle", ""],
          ["aspect", "First."],
        ],
        '{\n  "angle": "",\n  "aspect": "First.",\n  "phase": "Second."\n}\n',
      ],
      [
        "a multi-line definition and quotes escaped",
        [["lunar", 'Of the "moon".\n  Continued.']],
        '{\n  "lunar": "Of the \\"moon\\".\\n  Continued."\n}\n',
      ],
      [
        "a key that looks like an array index where it sorts, not first",
        [
          ["b", ""],
          ["10", ""],
          ["9", ""],
        ],
        '{\n  "10": "",\n  "9": "",\n  "b": ""\n}\n',
      ],
    ])("renders %s", (_case, entries, expected) => {
      expect(service.render(new Map(entries))).toBe(expected);
    });
  });

  describe("parse", () => {
    it.each([
      ["an empty object", "{}\n"],
      ["undefined words", '{\n  "angle": "",\n  "aspect": ""\n}\n'],
      [
        "multi-line definitions",
        '{\n  "angle": "First line.\\n  Second line.",\n  "aspect": "Done."\n}\n',
      ],
      ["a definition holding a colon and quotes", '{\n  "a": "x\\": y"\n}\n'],
    ])("reads %s and renders it back unchanged", (_case, content) => {
      expect(service.render(service.parse(content, PATH))).toBe(content);
    });

    it("reads every word with its definition", () => {
      expect([
        ...service.parse('{ "angle": "Bend.", "aspect": "" }', PATH),
      ]).toStrictEqual([
        ["angle", "Bend."],
        ["aspect", ""],
      ]);
    });

    it.each<[string, string, number | undefined, string]>([
      ["invalid JSON", '{ "angle": ', undefined, "not valid JSON"],
      ["text that is not JSON at all", "just words", undefined, "not valid"],
      ["an array", '["angle"]', undefined, "must be an object"],
      ["null", "null", undefined, "must be an object"],
      ["a bare string", '"angle"', undefined, "must be an object"],
      [
        "a non-string value",
        '{\n  "angle": 1\n}',
        undefined,
        'the value of "angle" is not a string',
      ],
      [
        "a nested object value",
        '{ "angle": { "a": "b" } }',
        undefined,
        'the value of "angle" is not a string',
      ],
      [
        "a null value",
        '{ "angle": null }',
        undefined,
        'the value of "angle" is not a string',
      ],
      [
        "a duplicated word whose first value is null",
        '{\n  "a": null,\n  "a": "x"\n}',
        3,
        'the word "a" is listed twice',
      ],
      [
        "a duplicated word whose first value is an object",
        '{ "a": { "k": "v" },\n "a": "x" }',
        2,
        'the word "a" is listed twice',
      ],
      [
        "a duplicated word after a non-string value",
        '{\n  "a": 1,\n  "b": "x",\n  "b": "x"\n}',
        4,
        'the word "b" is listed twice',
      ],
      [
        "a duplicated word",
        '{\n  "angle": "one",\n  "aspect": "",\n  "angle": "two"\n}',
        4,
        'the word "angle" is listed twice',
      ],
    ])("refuses %s", (_case, content, line, reason) => {
      const attempt = (): unknown => service.parse(content, PATH);
      const where = line === undefined ? PATH : `${PATH}:${line}`;

      expect(attempt).toThrow(MalformedGlossaryError);
      expect(attempt).toThrow(`Cannot parse the glossary at ${where}: `);
      expect(attempt).toThrow(reason);
    });
  });

  describe("read", () => {
    it.each<[string, string | undefined]>([
      ["a file that does not exist", undefined],
      ["an empty file", ""],
      ["a file of whitespace", "  \n"],
    ])("holds no glossary in %s", (_case, content) => {
      expect(service.read(content, PATH)).toBeUndefined();
    });

    it("reads the glossary a file holds", () => {
      expect([...(service.read('{ "angle": "" }', PATH) ?? [])]).toStrictEqual([
        ["angle", ""],
      ]);
    });

    it("refuses a file it cannot parse", () => {
      expect(() => service.read("{", PATH)).toThrow(MalformedGlossaryError);
    });
  });

  describe("write", () => {
    it("writes the whole file, replacing whatever it held", () => {
      expect(
        service.write({
          content: '{ "stale": "gone" }',
          destination: { path: PATH, type: "json" },
          glossary: new Map([["angle", "Bend."]]),
        }),
      ).toBe('{\n  "angle": "Bend."\n}\n');
    });
  });
});
