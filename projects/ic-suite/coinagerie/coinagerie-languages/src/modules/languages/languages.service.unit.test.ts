import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

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

  describe("languagesService when its dependencies are not yet defined", () => {
    const DEPENDENCIES = [
      ["../css/css.service", "CssService"],
      ["../hcl/hcl.service", "HclService"],
      ["../json/json.service", "JsonService"],
      ["../python/python.service", "PythonService"],
      ["../shell/shell.service", "ShellService"],
      ["../sql/sql.service", "SqlService"],
      ["../toml/toml.service", "TomlService"],
      ["../typescript/typescript.service", "TypescriptService"],
      ["../yaml/yaml.service", "YamlService"],
    ] as const;

    afterEach(() => {
      for (const [modulePath] of DEPENDENCIES) {
        vi.doUnmock(modulePath);
      }

      vi.resetModules();
    });

    it("records Object as each injection type, as a circular import would", async () => {
      vi.resetModules();

      for (const [modulePath, exportName] of DEPENDENCIES) {
        vi.doMock(modulePath, () => ({ [exportName]: undefined }));
      }

      const { LanguagesService: Reloaded } =
        await import("./languages.service");

      expect(Reflect.getMetadata("design:paramtypes", Reloaded)).toStrictEqual(
        DEPENDENCIES.map(() => Object),
      );
    });
  });
});
