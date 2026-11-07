import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { YamlService } from "./yaml.service";

describe(YamlService, () => {
  let service: YamlService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [YamlService],
    }).compile();

    service = await module.resolve(YamlService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    ["a key and its value", "name: hidden", ["name"]],
    ["a key with no value", "name:", ["name"]],
    ["a key with a trailing space", "name: ", ["name"]],
    [
      "nested keys",
      "outer:\n  inner: 1\n  other: 2",
      ["outer", "inner", "other"],
    ],
    ["a key with spaces", "my key: 1", ["my key"]],
    ["a hyphenated key", "max-retries: 3", ["max-retries"]],
    ["a dotted key", "a.b.c: 1", ["a.b.c"]],
    ["a key with a colon inside", "url:http: 1", ["url:http"]],
    ["a double quoted key", '"quoted key": 1', ["quoted key"]],
    ["a single quoted key", "'quoted key': 1", ["quoted key"]],
    ["a quoted key with an escape", String.raw`"a\"b": 1`, [String.raw`a\"b`]],
    ["a single quoted key with a doubled quote", "'it''s': 1", ["it''s"]],
    ["a quoted value", 'a: "hidden: words"', ["a"]],
    ["a single quoted value", "a: 'hidden: words'", ["a"]],
    ["an unterminated quoted value", 'a: "hidden\nb: 1', ["a", "b"]],
    ["an unterminated single quoted value", "a: 'hidden\nb: 1", ["a", "b"]],
    [
      "a plain value that holds a colon",
      "a: http://hidden.example/path",
      ["a"],
    ],
    ["a plain value with an apostrophe", "a: it's hidden", ["a"]],
    ["a plain scalar sequence", "- one\n- two", []],
    [
      "a sequence of mappings",
      "- id: 1\n  name: a\n- id: 2",
      ["id", "name", "id"],
    ],
    ["a nested sequence indicator", "- - id: 1", ["id"]],
    ["a comment on its own line", "# hidden: words\na: 1", ["a"]],
    ["a trailing comment", "a: 1 # hidden: words", ["a"]],
    ["a flow mapping", "a: { b: 1, c: 2 }", ["a", "b", "c"]],
    ["a quoted flow key", 'a: {"b": 1, "c":2}', ["a", "b", "c"]],
    ["a flow sequence", "a: [x, y, z]", ["a"]],
    ["a flow sequence of mappings", "a: [{b: 1}, {c: 2}]", ["a", "b", "c"]],
    [
      "a literal block scalar",
      "run: |\n  echo hidden: words\n  more: text\nnext: 1",
      ["run", "next"],
    ],
    [
      "a folded block scalar",
      "run: >-\n  hidden: words\nnext: 1",
      ["run", "next"],
    ],
    [
      "a block scalar with an indicator comment",
      "run: |2+ # hidden\n  hidden: words\nnext: 1",
      ["run", "next"],
    ],
    [
      "a block scalar with blank lines",
      "run: |\n  a\n\n  b: c\nnext: 1",
      ["run", "next"],
    ],
    [
      "a block scalar in a sequence item",
      "- run: |\n    hidden: words\n  name: a",
      ["run", "name"],
    ],
    [
      "a block scalar directly in a sequence",
      "- |\n  hidden: words\n- id: 1",
      ["id"],
    ],
    ["a block scalar at the end", "run: |\n  hidden: words", ["run"]],
    [
      "an anchor and an alias",
      "base: &base\n  a: 1\nother:\n  <<: *base",
      ["base", "a", "other", "<<"],
    ],
    ["a tag", "a: !!str 1\nb: !custom { c: 1 }", ["a", "b", "c"]],
    ["a document marker", "---\na: 1\n...", ["a"]],
    ["a directive", "%YAML 1.2\n---\na: 1", ["a"]],
    ["an explicit key", "? complex\n: value", []],
    ["an explicit key with a mapping", "? a: 1\n: value", ["a"]],
    ["windows line endings", "a: 1\r\nb: 2\r\n", ["a", "b"]],
    ["nothing", "", []],
    ["an empty line", "\n\n", []],
    ["an empty quoted key", '"": 1', []],
  ])("reads %s", (_name, source, expected) => {
    expect(service.tokenize(source)).toStrictEqual(expected);
  });
});
