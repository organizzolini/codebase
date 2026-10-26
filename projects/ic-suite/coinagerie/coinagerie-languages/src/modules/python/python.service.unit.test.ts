import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ScannerModule } from "../scanner/scanner.module";

import { PythonService } from "./python.service";

describe(PythonService, () => {
  let service: PythonService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ScannerModule],
      providers: [PythonService],
    }).compile();

    service = await module.resolve(PythonService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    ["a bare name", "value = 1", ["value"]],
    [
      "a function and its parameters",
      "def make(left, right):",
      ["def", "make", "left", "right"],
    ],
    ["a comment", "value = 1  # hidden words", ["value"]],
    ["a comment on its own line", "# only comment\nname", ["name"]],
    ["a double quoted string", 'name = "hidden words"', ["name"]],
    ["a single quoted string", "name = 'hidden words'", ["name"]],
    [
      "an escaped quote",
      String.raw`name = "say \"hidden\" now"; after`,
      ["name", "after"],
    ],
    [
      "a triple quoted docstring",
      'def f():\n    """Hidden\n    words."""\n    return',
      ["def", "f", "return"],
    ],
    ["a triple single quoted string", "x = '''hidden\nwords'''\ny", ["x", "y"]],
    ["an unterminated triple quote", 'x = """hidden', ["x"]],
    ["an unterminated string stops at the line", 'x = "hidden\ny', ["x", "y"]],
    ["a raw string prefix", 'path = r"hidden"', ["path"]],
    ["a bytes string prefix", 'data = rb"hidden"', ["data"]],
    ["an f-string prefix", 'text = f"{hidden}"', ["text"]],
    ["a name that ends like a prefix", 'bar"x"', ["bar"]],
    [
      "a quoted dictionary key",
      'config = {"retryCount": 3}',
      ["config", "retryCount"],
    ],
    [
      "a single quoted dictionary key",
      "config = {'retryCount': 3}",
      ["config", "retryCount"],
    ],
    [
      "a quoted value after a key",
      'config = {"key": "value"}',
      ["config", "key"],
    ],
    ["a string not followed by a separator", 'print("hello")', ["print"]],
    [
      "a compared string",
      'if kind == "circle":\n    pass',
      ["if", "kind", "pass"],
    ],
    ["an elif string", 'elif mode != "fast":', ["elif", "mode"]],
    ["a matched string", 'case "circle":', ["case"]],
    ["a number literal", "x = 0x1F + 10e3", ["x"]],
    ["an underscore name", "_private_name = 1", ["_private_name"]],
    ["a non-ascii name", "café = 1", ["café"]],
    ["an empty quoted key", 'x = {"": 1}', ["x"]],
    ["nothing", "", []],
    ["repeats kept", "a = a", ["a", "a"]],
  ])("reads %s", (_name, source, expected) => {
    expect(service.tokenize(source)).toStrictEqual(expected);
  });
});
