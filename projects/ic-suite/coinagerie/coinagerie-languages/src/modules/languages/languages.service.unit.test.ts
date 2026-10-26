import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { PythonModule } from "../python/python.module";
import { ShellModule } from "../shell/shell.module";
import { SqlModule } from "../sql/sql.module";
import { TypescriptModule } from "../typescript/typescript.module";

import { LanguagesService } from "./languages.service";

describe(LanguagesService, () => {
  let service: LanguagesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PythonModule, ShellModule, SqlModule, TypescriptModule],
      providers: [LanguagesService],
    }).compile();

    service = await module.resolve(LanguagesService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    "source.ts",
    "component.tsx",
    "module.mts",
    "module.cts",
    "types.d.ts",
    "script.js",
    "component.jsx",
    "module.mjs",
    "module.cjs",
    "SHOUTING.TS",
    "nested/folder/file.ts",
  ])("finds a tokenizer for %s", (filePath) => {
    const tokenizer = service.tokenizerFor(filePath);

    expect(tokenizer?.("const foundName = 1;", filePath)).toStrictEqual([
      "foundName",
    ]);
  });

  it.each([
    ["script.py", "value = 1  # hidden", "value"],
    ["stubs.pyi", "value = 1  # hidden", "value"],
    ["query.sql", "SELECT 1 -- hidden\nFROM tableName", "FROM"],
    ["run.sh", "# hidden\nrunName", "runName"],
    ["run.bash", "# hidden\nrunName", "runName"],
    ["run.zsh", "# hidden\nrunName", "runName"],
    ["run.ksh", "# hidden\nrunName", "runName"],
    ["QUERY.SQL", "-- hidden\ntableName", "tableName"],
  ])("finds a lexical tokenizer for %s", (filePath, source, expected) => {
    expect(service.tokenizerFor(filePath)?.(source, filePath)).toContain(
      expected,
    );
  });

  it.each([
    "README.md",
    "image.png",
    "Makefile",
    ".gitignore",
    "archive.ts.gz",
  ])("finds no tokenizer for %s", (filePath) => {
    expect(service.tokenizerFor(filePath)).toBeUndefined();
  });
});
