import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ScannerModule } from "../scanner/scanner.module";

import { TomlService } from "./toml.service";

describe(TomlService, () => {
  let service: TomlService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ScannerModule],
      providers: [TomlService],
    }).compile();

    service = await module.resolve(TomlService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("declares an Object dependency when the scanner is not loaded yet", async () => {
    // An import cycle can leave the scanner undefined while this class is
    // decorated, and the decorator metadata then falls back to Object.
    vi.resetModules();
    vi.doMock("../scanner/scanner.service", () => ({
      ScannerService: undefined,
    }));

    const { TomlService: Reloaded } = await import("./toml.service");

    expect(Reflect.getMetadata("design:paramtypes", Reloaded)).toStrictEqual([
      Object,
    ]);

    vi.doUnmock("../scanner/scanner.service");
    vi.resetModules();
  });

  it.each([
    ["a bare key", 'name = "hidden"', ["name"]],
    ["a hyphenated key", "max-retries = 3", ["max-retries"]],
    ["a comment", "a = 1 # hidden words", ["a"]],
    ["a comment on its own line", "# hidden\na = 1", ["a"]],
    ["a table header", "[server]\nport = 1", ["server", "port"]],
    ["a dotted table header", "[server.limits]", ["server", "limits"]],
    ["an array table header", "[[products]]\nname = 1", ["products", "name"]],
    ["a quoted key", '"quoted key" = 1', ["quoted key"]],
    ["a single quoted key", "'quoted key' = 1", ["quoted key"]],
    ["a quoted key in a dotted path", 'a."b".c = 1', ["a", "b", "c"]],
    [
      "a quoted segment of a table header",
      '[servers."alpha"]',
      ["servers", "alpha"],
    ],
    [
      "a quoted first segment of a table header",
      '["alpha".beta]',
      ["alpha", "beta"],
    ],
    [
      "a quoted last segment of an array table header",
      '[[servers."alpha"]]',
      ["servers", "alpha"],
    ],
    ["a string array value", 'files = ["a.ts", "b.ts"]', ["files"]],
    ["a one element array value", 'files = ["a.ts"]', ["files"]],
    [
      "a string array on a line of its own",
      'files = [\n  "a.ts",\n  "b.ts",\n]',
      ["files"],
    ],
    [
      "an inline table",
      'point = { x = 1, "y-axis" = 2 }',
      ["point", "x", "y-axis"],
    ],
    ["a basic string value", 'a = "hidden words"', ["a"]],
    ["an escaped quote", 'a = "say \\"hidden\\""\nb = 1', ["a", "b"]],
    ["a literal string value", "a = 'hidden words'", ["a"]],
    [
      "a multi-line basic string",
      'a = """\nhidden\nwords\n"""\nb = 1',
      ["a", "b"],
    ],
    [
      "a multi-line literal string",
      "a = '''\nhidden\nwords\n'''\nb = 1",
      ["a", "b"],
    ],
    ["an unterminated multi-line string", 'a = """hidden', ["a"]],
    ["an unterminated string", 'a = "hidden\nb = 1', ["a", "b"]],
    ["a date and time", "when = 1979-05-27T07:32:00Z", ["when"]],
    ["a float and an integer", "a = 3.14\nb = 1_000", ["a", "b"]],
    ["a boolean", "enabled = true", ["enabled", "true"]],
    ["nothing", "", []],
  ])("reads %s", (_name, source, expected) => {
    expect(service.tokenize(source)).toStrictEqual(expected);
  });
});
