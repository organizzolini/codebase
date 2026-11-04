import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { PLAIN_IDENTIFIER } from "./scanner.constants";
import { ScannerService } from "./scanner.service";

import type { LexicalGrammar } from "./scanner.types";

const headerGrammar: LexicalGrammar = {
  identifier: PLAIN_IDENTIFIER,
  keys: [{ after: /\]/y, before: /^\[$/ }],
  rules: [{ kind: "string", pattern: /"([^"\n]*)"?/y }],
};

const keysOnlyGrammar: LexicalGrammar = {
  keys: [{ after: /:/y }],
  rules: [{ kind: "string", pattern: /"([^"\n]*)"?/y }],
};

describe(ScannerService, () => {
  let service: ScannerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ScannerService],
    }).compile();

    service = await module.resolve(ScannerService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    ["a string that opens its line before the separator", '["head"]', ["head"]],
    ["a string with other text before it on the line", 'x = ["head"]', ["x"]],
    ["a string on a later line", 'a\n["head"]', ["a", "head"]],
  ])("applies the text before a key: %s", (_name, source, expected) => {
    expect(service.scan(source, headerGrammar)).toStrictEqual(expected);
  });

  it.each([
    [
      "bare words are never read without an identifier pattern",
      'word "key": 1',
      ["key"],
    ],
    ["a value is not read", '"key": "value"', ["key"]],
  ])("reads only keys: %s", (_name, source, expected) => {
    expect(service.scan(source, keysOnlyGrammar)).toStrictEqual(expected);
  });

  it("never stalls on a pattern that matches nothing", () => {
    expect(service.scan("###", headerGrammar)).toStrictEqual([]);
  });
});
