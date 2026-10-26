import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ConfigurationFileNotFoundError,
  InvalidConfigurationError,
} from "@coinagerie/core";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_INCLUDE } from "./configuration.constants";
import { ConfigurationService } from "./configuration.service";

/**
 * Configuration files are written inside this project's gitignored `tmp/`,
 * because jiti resolves a configuration's imports from where the file sits.
 */
const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../../../tmp");

describe(ConfigurationService, () => {
  let service: ConfigurationService;
  let directory: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ConfigurationService],
    }).compile();

    service = await module.resolve(ConfigurationService);
  });

  beforeEach(() => {
    mkdirSync(TEMPORARY_ROOT, { recursive: true });
    directory = mkdtempSync(path.join(TEMPORARY_ROOT, "configuration-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  function writeConfiguration(relativePath: string, source: string): string {
    const filePath = path.join(directory, relativePath);
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, source);
    return filePath;
  }

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("falls back to every default when no configuration file exists", async () => {
    const configuration = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(configuration).toStrictEqual({
      configurationPath: undefined,
      directory,
      exclude: { paths: [] },
      include: [...DEFAULT_INCLUDE],
      outputs: [],
    });
  });

  it("finds a coinagerie.config.ts in the working directory", async () => {
    const configurationPath = writeConfiguration(
      "coinagerie.config.ts",
      'export default { include: ["src/**"] };\n',
    );

    const configuration = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(configuration.configurationPath).toBe(configurationPath);
    expect(configuration.include).toStrictEqual(["src/**"]);
  });

  it("reads a named file relative to the working directory and roots the run at its folder", async () => {
    const configurationPath = writeConfiguration(
      "nested/coinagerie.config.ts",
      [
        "export default {",
        '  exclude: { paths: ["**/*.test.ts"] },',
        '  outputs: [{ description: "Words.", path: "README.md", type: "markdown" }],',
        "};",
        "",
      ].join("\n"),
    );

    const configuration = await service.loadConfiguration({
      configurationPath: "nested/coinagerie.config.ts",
      workingDirectory: directory,
    });

    expect(configuration).toStrictEqual({
      configurationPath,
      directory: path.join(directory, "nested"),
      exclude: { paths: ["**/*.test.ts"] },
      include: [...DEFAULT_INCLUDE],
      outputs: [
        {
          description: "Words.",
          path: path.join(directory, "nested/README.md"),
          type: "markdown",
        },
      ],
    });
  });

  it("leaves a markdown output's description undefined when none is written", async () => {
    writeConfiguration(
      "coinagerie.config.ts",
      'export default { outputs: [{ path: "GLOSSARY.md", type: "markdown" }] };\n',
    );

    const configuration = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(configuration.outputs).toStrictEqual([
      {
        description: undefined,
        path: path.join(directory, "GLOSSARY.md"),
        type: "markdown",
      },
    ]);
  });

  it("resolves json and markdown outputs side by side, in the order written", async () => {
    writeConfiguration(
      "coinagerie.config.ts",
      [
        "export default {",
        "  outputs: [",
        '    { path: "glossary.json", type: "json" },',
        '    { description: "Words.", path: "README.md", type: "markdown" },',
        "  ],",
        "};",
        "",
      ].join("\n"),
    );

    const configuration = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(configuration.outputs).toStrictEqual([
      { path: path.join(directory, "glossary.json"), type: "json" },
      {
        description: "Words.",
        path: path.join(directory, "README.md"),
        type: "markdown",
      },
    ]);
  });

  it("refuses a named file that does not exist", async () => {
    await expect(
      service.loadConfiguration({
        configurationPath: "missing.config.ts",
        workingDirectory: directory,
      }),
    ).rejects.toThrow(ConfigurationFileNotFoundError);
  });

  it.each([
    ["a field of the wrong type", 'export default { include: "src" };\n'],
    ["an unknown field", "export default { inputs: [] };\n"],
    ["an unknown exclusion", "export default { exclude: { files: [] } };\n"],
    [
      "an output of an unknown type",
      'export default { outputs: [{ path: "a.txt", type: "text" }] };\n',
    ],
    [
      "a json output with a description",
      'export default { outputs: [{ description: "Words.", path: "a.json", type: "json" }] };\n',
    ],
    [
      "a json output with no path",
      'export default { outputs: [{ type: "json" }] };\n',
    ],
    [
      "a markdown output with no path",
      'export default { outputs: [{ type: "markdown" }] };\n',
    ],
    [
      "a description holding a list item",
      'export default { outputs: [{ description: "Intro.\\n- item", path: "a.md", type: "markdown" }] };\n',
    ],
    [
      "two outputs naming the same file",
      'export default { outputs: [{ path: "a.txt", type: "json" }, { path: "./a.txt", type: "markdown" }] };\n',
    ],
    ["a default export that is not an object", "export default 42;\n"],
    ["a file that throws while loading", 'throw new Error("broken");\n'],
    ["a file that throws something other than an error", 'throw "broken";\n'],
  ])("refuses %s, naming the file", async (_case, source) => {
    const configurationPath = writeConfiguration(
      "coinagerie.config.ts",
      source,
    );

    const loading = service.loadConfiguration({ workingDirectory: directory });

    await expect(loading).rejects.toThrow(InvalidConfigurationError);
    await expect(loading).rejects.toThrow(configurationPath);
  });

  describe("flag overrides", () => {
    const FILE = [
      "export default {",
      '  exclude: { paths: ["fileExclude"] },',
      '  include: ["fileInclude"],',
      "  outputs: [",
      '    { path: "file.json", type: "json" },',
      '    { description: "From the file.", path: "FILE.md", type: "markdown" },',
      "  ],",
      "};",
      "",
    ].join("\n");

    it("takes every flag in place of what the file says", async () => {
      writeConfiguration("project/coinagerie.config.ts", FILE);

      const configuration = await service.loadConfiguration({
        configurationPath: "project/coinagerie.config.ts",
        overrides: {
          description: "From a flag.",
          excludePaths: ["flagExclude"],
          include: ["flagInclude", "second"],
          outputJson: "flag.json",
          outputMarkdown: "flag/FLAG.md",
        },
        workingDirectory: directory,
      });

      expect(configuration.exclude).toStrictEqual({ paths: ["flagExclude"] });
      expect(configuration.include).toStrictEqual(["flagInclude", "second"]);
      expect(configuration.outputs).toStrictEqual([
        { path: path.join(directory, "flag.json"), type: "json" },
        {
          description: "From a flag.",
          path: path.join(directory, "flag/FLAG.md"),
          type: "markdown",
        },
      ]);
      expect(configuration.directory).toBe(path.join(directory, "project"));
    });

    it("leaves what no flag names as the file wrote it", async () => {
      writeConfiguration("coinagerie.config.ts", FILE);

      const configuration = await service.loadConfiguration({
        overrides: {},
        workingDirectory: directory,
      });

      expect(configuration.include).toStrictEqual(["fileInclude"]);
      expect(configuration.outputs).toStrictEqual([
        { path: path.join(directory, "file.json"), type: "json" },
        {
          description: "From the file.",
          path: path.join(directory, "FILE.md"),
          type: "markdown",
        },
      ]);
    });

    it("replaces the file's outputs with only the destinations a flag names", async () => {
      writeConfiguration("coinagerie.config.ts", FILE);

      const configuration = await service.loadConfiguration({
        overrides: { outputJson: "only.json" },
        workingDirectory: directory,
      });

      expect(configuration.outputs).toStrictEqual([
        { path: path.join(directory, "only.json"), type: "json" },
      ]);
    });

    it("sets the description of the file's markdown outputs when no destination flag is given", async () => {
      writeConfiguration("coinagerie.config.ts", FILE);

      const configuration = await service.loadConfiguration({
        overrides: { description: "Flagged." },
        workingDirectory: directory,
      });

      expect(configuration.outputs).toStrictEqual([
        { path: path.join(directory, "file.json"), type: "json" },
        {
          description: "Flagged.",
          path: path.join(directory, "FILE.md"),
          type: "markdown",
        },
      ]);
    });

    it("layers flags over the defaults when there is no file", async () => {
      const configuration = await service.loadConfiguration({
        overrides: { excludePaths: ["dist"], outputMarkdown: "GLOSSARY.md" },
        workingDirectory: directory,
      });

      expect(configuration.configurationPath).toBeUndefined();
      expect(configuration.include).toStrictEqual([...DEFAULT_INCLUDE]);
      expect(configuration.exclude).toStrictEqual({ paths: ["dist"] });
      expect(configuration.outputs).toStrictEqual([
        {
          description: undefined,
          path: path.join(directory, "GLOSSARY.md"),
          type: "markdown",
        },
      ]);
    });

    it("refuses two flags that name the same file, naming the command line", async () => {
      const loading = service.loadConfiguration({
        overrides: { outputJson: "same.md", outputMarkdown: "same.md" },
        workingDirectory: directory,
      });

      await expect(loading).rejects.toThrow(InvalidConfigurationError);
      await expect(loading).rejects.toThrow("the command line");
    });

    it.each<[string, object]>([
      ["an empty json path", { outputJson: "" }],
      ["an empty markdown path", { outputMarkdown: "" }],
      ["a description holding a list item", { description: "- item" }],
      ["an unknown flag", { fold: "x" }],
    ])("refuses %s, naming the command line", async (_case, overrides) => {
      const loading = service.loadConfiguration({
        overrides,
        workingDirectory: directory,
      });

      await expect(loading).rejects.toThrow(InvalidConfigurationError);
      await expect(loading).rejects.toThrow("the command line");
    });
  });
});
