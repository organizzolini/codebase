import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ScannerModule } from "../scanner/scanner.module";

import { JsonService } from "./json.service";

describe(JsonService, () => {
  let service: JsonService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ScannerModule],
      providers: [JsonService],
    }).compile();

    service = await module.resolve(JsonService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    ["a key and its value", '{"name": "hidden"}', ["name"]],
    ["a key with no space before the colon", '{"name":"hidden"}', ["name"]],
    ["a key with a space before the colon", '{"name" : 1}', ["name"]],
    ["a key whose colon is on the next line", '{"name"\n: 1}', ["name"]],
    ["nested keys", '{"outer": {"inner": 1}}', ["outer", "inner"]],
    ["an array of strings", '{"files": ["a", "b"]}', ["files"]],
    ["an array of objects", '[{"id": 1}, {"id": 2}]', ["id", "id"]],
    [
      "a literal and a number value",
      '{"a": true, "b": null, "c": 1.5e3}',
      ["a", "b", "c"],
    ],
    ["a string value that holds a colon", '{"a": "x: y"}', ["a"]],
    ["an escaped quote in a key", String.raw`{"a\"b": 1}`, [String.raw`a\"b`]],
    [
      "an escaped quote in a value",
      String.raw`{"a": "say \"hidden\"", "b": 1}`,
      ["a", "b"],
    ],
    ["a line comment", '{\n// hidden words\n"a": 1}', ["a"]],
    ["a block comment", '{/* "hidden": 1 */ "a": 1}', ["a"]],
    ["an unterminated block comment", '{"a": 1 /* hidden', ["a"]],
    ["an empty key", '{"": 1}', []],
    ["an unterminated string", '{"a": "hidden', ["a"]],
    [
      "an unterminated string that ends at its line",
      '{"a": "hidden\n"b": 1}',
      ["a", "b"],
    ],
    ["a bare top-level string", '"hidden"', []],
    ["nothing", "", []],
  ])("reads %s", (_name, source, expected) => {
    expect(service.tokenize(source)).toStrictEqual(expected);
  });
});
