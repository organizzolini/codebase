import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ConfigurationFileNotFoundError,
  InvalidConfigurationError,
} from "@coinagerie/core";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { DEFAULT_INCLUDE } from "./configuration.constants";
import { ConfigurationService } from "./configuration.service";

describe(ConfigurationService, () => {
  let service: ConfigurationService;
  let directory: string;

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(ConfigurationService));
  });

  beforeEach(() => {
    directory = createTemporaryDirectory("configuration");
  });

  function writeConfiguration(relativePath: string, source: string): string {
    const filePath = path.join(directory, relativePath);
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, source);
    return filePath;
  }

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ConfigurationService);

    expect(instance).toBeInstanceOf(ConfigurationService);
  });

  it("falls back to every default when no configuration file exists", async () => {
    const configuration = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(configuration).toStrictEqual({
      configurationPath: undefined,
      directory,
      exclude: { paths: [], patterns: [], words: [] },
      fold: undefined,
      include: [...DEFAULT_INCLUDE],
      outputs: [],
      unfolded: [],
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
      exclude: { paths: ["**/*.test.ts"], patterns: [], words: [] },
      fold: undefined,
      include: [...DEFAULT_INCLUDE],
      outputs: [
        {
          description: "Words.",
          path: path.join(directory, "nested/README.md"),
          type: "markdown",
        },
      ],
      unfolded: [],
    });
  });

  it("resolves exclude.words written as a list", async () => {
    writeConfiguration(
      "coinagerie.config.ts",
      'export default { exclude: { words: ["service", "gate"] } };\n',
    );

    const configuration = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(configuration.exclude.words).toStrictEqual(["service", "gate"]);
  });

  it.each([
    ["a synchronous function", "() => ['service']"],
    ["an asynchronous function", "async () => ['service']"],
  ])(
    "resolves exclude.words written as %s into its list",
    async (_case, source) => {
      writeConfiguration(
        "coinagerie.config.ts",
        `export default { exclude: { words: ${source} } };\n`,
      );

      const { exclude } = await service.loadConfiguration({
        workingDirectory: directory,
      });

      expect(exclude.words).toStrictEqual(["service"]);
    },
  );

  it("resolves a regular expression in exclude.words into a pattern beside the words", async () => {
    writeConfiguration(
      "coinagerie.config.ts",
      'export default { exclude: { words: ["service", /^(task|test)\\d{3}$/] } };\n',
    );

    const { exclude } = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(exclude).toStrictEqual({
      paths: [],
      patterns: [/^(task|test)\d{3}$/],
      words: ["service"],
    });
  });

  it.each([
    ["a synchronous function", String.raw`() => [/^md\d{3}$/, 'service']`],
    [
      "an asynchronous function",
      String.raw`async () => [/^md\d{3}$/, 'service']`,
    ],
  ])(
    "resolves exclude.words written as %s holding a pattern into its words and patterns",
    async (_case, source) => {
      writeConfiguration(
        "coinagerie.config.ts",
        `export default { exclude: { words: ${source} } };\n`,
      );

      const { exclude } = await service.loadConfiguration({
        workingDirectory: directory,
      });

      expect(exclude).toStrictEqual({
        paths: [],
        patterns: [/^md\d{3}$/],
        words: ["service"],
      });
    },
  );

  it("drops the global and sticky flags from a pattern, which make a test stateful", async () => {
    writeConfiguration(
      "coinagerie.config.ts",
      "export default { exclude: { words: [/^md\\d{3}$/giy] } };\n",
    );

    const { exclude } = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(exclude.patterns.map((pattern) => pattern.flags)).toStrictEqual([
      "i",
    ]);
    expect(exclude.patterns[0]?.test("md001")).toBe(true);
    expect(exclude.patterns[0]?.test("md001")).toBe(true);
  });

  it("keeps a pattern's case-insensitive flag", async () => {
    writeConfiguration(
      "coinagerie.config.ts",
      "export default { exclude: { words: [/^MD\\d{3}$/i] } };\n",
    );

    const { exclude } = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(exclude.patterns[0]?.flags).toBe("i");
  });

  it("keeps the unfolded words", async () => {
    writeConfiguration(
      "coinagerie.config.ts",
      'export default { unfolded: ["pisces", "pallas"] };\n',
    );

    const { unfolded } = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(unfolded).toStrictEqual(["pisces", "pallas"]);
  });

  it("keeps a fold function callable", async () => {
    writeConfiguration(
      "coinagerie.config.ts",
      'export default { fold: (word: string) => (word === "configuration" ? "configure" : word) };\n',
    );

    const { fold } = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(fold?.("configuration")).toBe("configure");
    expect(fold?.("aspect")).toBe("aspect");
  });

  it.each([
    [
      "an exclude.words function that throws an error",
      "exclude: { words: () => { throw new Error('unreadable parent glossary'); } }",
      "unreadable parent glossary",
    ],
    [
      "an exclude.words function that rejects",
      "exclude: { words: async () => { throw new Error('unreadable parent glossary'); } }",
      "unreadable parent glossary",
    ],
    [
      "an exclude.words function that throws something other than an error",
      "exclude: { words: () => { throw 'unreadable parent glossary'; } }",
      "unreadable parent glossary",
    ],
    [
      "an exclude.words function that returns a string",
      "exclude: { words: () => 'service' }",
      "list of strings",
    ],
    [
      "an exclude.words function that returns nothing",
      "exclude: { words: () => undefined }",
      "list of strings",
    ],
    [
      "an exclude.words function that returns a list holding a number",
      "exclude: { words: () => [1] }",
      "list of strings",
    ],
    [
      "an exclude.words function that returns a list holding a pattern and a number",
      String.raw`exclude: { words: () => [/^md\d{3}$/, 1] }`,
      "list of strings or RegExp objects",
    ],
  ])("refuses %s, naming the file", async (_case, field, reason) => {
    const configurationPath = writeConfiguration(
      "coinagerie.config.ts",
      `export default { ${field} };\n`,
    );

    const loading = service.loadConfiguration({ workingDirectory: directory });

    await expect(loading).rejects.toThrow(InvalidConfigurationError);
    await expect(loading).rejects.toThrow(configurationPath);
    await expect(loading).rejects.toThrow(reason);
  });

  it.each([
    [
      "throws an error",
      "() => { throw new Error('no mapping'); }",
      "no mapping",
    ],
    [
      "throws something other than an error",
      "() => { throw 'no mapping'; }",
      "no mapping",
    ],
    ["returns an empty string", "() => ''", `""`],
    ["returns text with whitespace", "() => 'two words'", "two words"],
    ["returns text with an asterisk", "() => 'a*b'", "a*b"],
    ["returns a number", "() => 42", "type number"],
    ["returns nothing", "() => undefined", "type undefined"],
    ["returns a promise", "async () => 'aspect'", "synchronous"],
  ])(
    "refuses a fold that %s when it is called, naming the file",
    async (_case, source, reason) => {
      const configurationPath = writeConfiguration(
        "coinagerie.config.ts",
        `export default { fold: ${source} };\n`,
      );
      const { fold } = await service.loadConfiguration({
        workingDirectory: directory,
      });

      expect(() => fold?.("aspect")).toThrow(InvalidConfigurationError);
      expect(() => fold?.("aspect")).toThrow(configurationPath);
      expect(() => fold?.("aspect")).toThrow(reason);
    },
  );

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
      "exclude.words that is neither a list nor a function",
      'export default { exclude: { words: "service" } };\n',
    ],
    [
      "exclude.words holding a non-string",
      "export default { exclude: { words: [1] } };\n",
    ],
    [
      "exclude.words holding a pattern beside a non-string and a non-pattern",
      "export default { exclude: { words: [/^md\\d{3}$/, true, {}] } };\n",
    ],
    ["a fold that is not a function", 'export default { fold: "aspect" };\n'],
    [
      "an unfolded word with a space",
      'export default { unfolded: ["a b"] };\n',
    ],
    [
      "an unfolded word with a capital",
      'export default { unfolded: ["Pisces"] };\n',
    ],
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

  it("names exclude.words in the refusal of an entry that is neither a word nor a pattern", async () => {
    const configurationPath = writeConfiguration(
      "coinagerie.config.ts",
      "export default { exclude: { words: [/^md\\d{3}$/, true] } };\n",
    );

    const loading = service.loadConfiguration({ workingDirectory: directory });

    await expect(loading).rejects.toThrow(InvalidConfigurationError);
    await expect(loading).rejects.toThrow(configurationPath);
    await expect(loading).rejects.toThrow("exclude.words");
  });

  describe("flag overrides", () => {
    const FILE = [
      "export default {",
      '  exclude: { paths: ["fileExclude"], words: ["fileWord"] },',
      "  fold: (word: string) => word.toUpperCase(),",
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

      expect(configuration.exclude).toStrictEqual({
        paths: ["flagExclude"],
        patterns: [],
        words: ["fileWord"],
      });
      expect(configuration.fold?.("word")).toBe("WORD");
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
      expect(configuration.exclude).toStrictEqual({
        paths: ["dist"],
        patterns: [],
        words: [],
      });
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
