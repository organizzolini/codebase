import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { ScannerModule } from "../scanner/scanner.module";

import { SqlService } from "./sql.service";

describe(SqlService, () => {
  let service: SqlService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ScannerModule],
      providers: [SqlService],
    }).compile();

    service = await module.resolve(SqlService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    ["a select", "SELECT id FROM users", ["SELECT", "id", "FROM", "users"]],
    [
      "a line comment",
      "SELECT 1 -- hidden words\nFROM t",
      ["SELECT", "FROM", "t"],
    ],
    ["a block comment", "SELECT /* hidden\nwords */ id", ["SELECT", "id"]],
    ["an unterminated block comment", "id /* hidden", ["id"]],
    ["a string literal", "WHERE name = 'hidden words'", ["WHERE", "name"]],
    ["a doubled quote escape", "x = 'it''s hidden' AND y", ["x", "AND", "y"]],
    ["an unterminated string", "x = 'hidden", ["x"]],
    [
      "a string prefix",
      "x = E'hidden' OR N'hidden' OR X'1F'",
      ["x", "OR", "OR"],
    ],
    [
      "a double quoted identifier",
      'SELECT "OrderTotal" FROM t',
      ["SELECT", "OrderTotal", "FROM", "t"],
    ],
    [
      "a doubled quote inside an identifier",
      'SELECT "a""b"',
      ["SELECT", 'a""b'],
    ],
    [
      "a backtick quoted identifier",
      "SELECT `user_id` FROM t",
      ["SELECT", "user_id", "FROM", "t"],
    ],
    ["an empty quoted identifier", 'SELECT ""', ["SELECT"]],
    [
      "a dollar quoted body",
      "AS $$ hidden words $$ LANGUAGE sql",
      ["AS", "LANGUAGE", "sql"],
    ],
    [
      "a tagged dollar quoted body",
      "AS $body$ hidden $$ words $body$ END",
      ["AS", "END"],
    ],
    ["an unterminated dollar quote", "AS $$ hidden", ["AS"]],
    ["a positional parameter", "WHERE id = $1", ["WHERE", "id"]],
    ["a number literal", "LIMIT 10 OFFSET 0x1F", ["LIMIT", "OFFSET"]],
    ["a dollar inside a name", "SELECT a$b", ["SELECT", "a$b"]],
    ["a string followed by a colon", "x = 'key': y", ["x", "y"]],
    ["nothing", "", []],
  ])("reads %s", (_name, source, expected) => {
    expect(service.tokenize(source)).toStrictEqual(expected);
  });
});
