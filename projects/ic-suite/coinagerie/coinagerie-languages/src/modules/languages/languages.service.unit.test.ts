import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { CssModule } from "../css/css.module";
import { HclModule } from "../hcl/hcl.module";
import { JsonModule } from "../json/json.module";
import { PythonModule } from "../python/python.module";
import { ShellModule } from "../shell/shell.module";
import { SqlModule } from "../sql/sql.module";
import { TomlModule } from "../toml/toml.module";
import { TypescriptModule } from "../typescript/typescript.module";
import { YamlModule } from "../yaml/yaml.module";

import { LanguagesService } from "./languages.service";

describe(LanguagesService, () => {
  let service: LanguagesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        CssModule,
        HclModule,
        JsonModule,
        PythonModule,
        ShellModule,
        SqlModule,
        TomlModule,
        TypescriptModule,
        YamlModule,
      ],
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
    ["style.css", "/* hidden */ .cardName {}", "cardName"],
    ["main.tf", "# hidden\nregionName = 1", "regionName"],
    ["vars.tfvars", "# hidden\nregionName = 1", "regionName"],
    ["config.hcl", "# hidden\nregionName = 1", "regionName"],
    ["package.json", '{"hidden": "x", "keyName": 1}', "keyName"],
    ["tsconfig.jsonc", '// hidden\n{"keyName": 1}', "keyName"],
    ["config.yaml", "# hidden\nkeyName: 1", "keyName"],
    ["config.yml", "# hidden\nkeyName: 1", "keyName"],
    ["pyproject.toml", "# hidden\nprojectName = 1", "projectName"],
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
