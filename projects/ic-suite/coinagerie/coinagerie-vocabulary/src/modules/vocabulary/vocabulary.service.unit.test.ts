import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { DEFAULT_INCLUDE } from "@coinagerie/configuration";
import { LanguagesModule, typescriptKeywords } from "@coinagerie/languages";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { DiscoveryModule } from "../discovery/discovery.module";
import { FoldingModule } from "../folding/folding.module";
import { WordsModule } from "../words/words.module";

import { VocabularyService } from "./vocabulary.service";

import type { ResolvedCoinagerieConfiguration } from "@coinagerie/configuration";

describe(VocabularyService, () => {
  let service: VocabularyService;
  let root: string;

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(VocabularyService, {
      imports: [DiscoveryModule, FoldingModule, LanguagesModule, WordsModule],
    }));
  });

  beforeEach(() => {
    root = createTemporaryDirectory("vocabulary");
    mkdirSync(path.join(root, ".git"));
  });

  function writeTree(files: Record<string, string>): void {
    for (const [relativePath, contents] of Object.entries(files)) {
      const absolutePath = path.join(root, relativePath);
      mkdirSync(path.dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, contents);
    }
  }

  function configure(
    overrides: Partial<ResolvedCoinagerieConfiguration> = {},
  ): ResolvedCoinagerieConfiguration {
    return {
      configurationPath: undefined,
      directory: root,
      exclude: { paths: [], patterns: [], words: [] },
      fold: undefined,
      include: [...DEFAULT_INCLUDE],
      outputs: [],
      ...overrides,
    };
  }

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(VocabularyService, {
      imports: [DiscoveryModule, FoldingModule, LanguagesModule, WordsModule],
    });

    expect(instance).toBeInstanceOf(VocabularyService);
  });

  it("collects the words of every identifier and every path, sorted and once each", async () => {
    writeTree({
      "notes/logoMark.png": "binary",
      "README.md": "# Prose never counts\n",
      "src/aspect-phase-emoji.service.ts": [
        "// commentHidden",
        "export class AspectPhaseEmojiService {",
        '  readonly lunarCycle = "stringHidden";',
        "}",
        "",
      ].join("\n"),
    });

    await expect(service.collect(configure())).resolves.toStrictEqual([
      "aspect",
      "cycle",
      "emoji",
      "logo",
      "lunar",
      "mark",
      "note",
      "phase",
      "readme",
      "service",
      "src",
    ]);
  });

  it("folds plurals and inflections into one headword", async () => {
    writeTree({
      "src/aspects.ts": [
        "export const aspect = configured(aspects);",
        "const configuring = configuration;",
        "",
      ].join("\n"),
    });

    await expect(service.collect(configure())).resolves.toStrictEqual([
      "aspect",
      "configuration",
      "configure",
      "src",
    ]);
  });

  it("scans only what the configuration includes and does not exclude", async () => {
    writeTree({
      "src/first.ts": "const firstName = 1;\n",
      "src/left.test.ts": "const leftName = 1;\n",
      "vendor/other.ts": "const otherName = 1;\n",
    });

    await expect(
      service.collect(
        configure({
          exclude: { paths: ["**/*.test.ts"], patterns: [], words: [] },
          include: ["src/**"],
        }),
      ),
    ).resolves.toStrictEqual(["first", "name", "src"]);
  });

  it("leaves out every file the configuration writes a glossary to", async () => {
    writeTree({ "GLOSSARY.md": "", "src/main.ts": "" });

    await expect(
      service.collect(
        configure({
          outputs: [
            {
              description: undefined,
              path: path.join(root, "GLOSSARY.md"),
              type: "markdown",
            },
          ],
        }),
      ),
    ).resolves.toStrictEqual(["main", "src"]);
  });

  it("runs the configured fold after plurals and inflections are folded", async () => {
    writeTree({
      "src/main.ts": "const setups = configuration + configured;\n",
    });

    await expect(
      service.collect(
        configure({
          fold: (word) => (word === "configuration" ? "configure" : word),
        }),
      ),
    ).resolves.toStrictEqual(["configure", "main", "setup", "src"]);
  });

  it("excludes the words the configuration lists, and the forms folded into them", async () => {
    writeTree({
      "src/main.ts": "const gate = services + service + Service;\n",
    });

    await expect(
      service.collect(
        configure({ exclude: { paths: [], patterns: [], words: ["service"] } }),
      ),
    ).resolves.toStrictEqual(["gate", "main", "src"]);
  });

  it("excludes a word named by one of its forms, in any case", async () => {
    writeTree({ "src/main.ts": "const gate = service + implement;\n" });

    await expect(
      service.collect(
        configure({
          exclude: {
            paths: [],
            patterns: [],
            words: ["Services", "implements"],
          },
        }),
      ),
    ).resolves.toStrictEqual(["gate", "main", "src"]);
  });

  it("excludes after the configured fold, so a merged family goes together", async () => {
    writeTree({ "src/main.ts": "const configuration = configure;\n" });
    const fold = (word: string): string =>
      word === "configuration" ? "configure" : word;

    await expect(
      service.collect(
        configure({
          exclude: { paths: [], patterns: [], words: ["configuration"] },
          fold,
        }),
      ),
    ).resolves.toStrictEqual(["main", "src"]);
  });

  it("excludes nothing of the language's keywords until they are spread into exclude.words", async () => {
    writeTree({
      "src/main.ts": "const options = { default: 1, type: 2, aspect: 3 };\n",
    });

    await expect(service.collect(configure())).resolves.toStrictEqual([
      "aspect",
      "default",
      "main",
      "option",
      "src",
      "type",
    ]);
    await expect(
      service.collect(
        configure({
          exclude: {
            paths: [],
            patterns: [],
            words: [...typescriptKeywords, "options"],
          },
        }),
      ),
    ).resolves.toStrictEqual(["aspect", "main", "src"]);
  });

  it("keeps a word excluded as a headword even when folding it again would move it", async () => {
    writeTree({ "src/main.ts": "const boundingBox = bounded;\n" });

    await expect(
      service.collect(
        configure({
          exclude: { paths: [], patterns: [], words: ["bound", "box"] },
        }),
      ),
    ).resolves.toStrictEqual(["main", "src"]);
  });

  it("removes every headword a pattern matches and keeps the rest", async () => {
    writeTree({
      "src/main.ts": "export const md001 = 1;\nexport const mdx = 2;\n",
    });

    await expect(
      service.collect(
        configure({
          exclude: { paths: [], patterns: [/^md\d{3}$/], words: [] },
        }),
      ),
    ).resolves.toStrictEqual(["main", "mdx", "src"]);
  });

  it("keeps string exclusions to whole words while a pattern runs beside them", async () => {
    writeTree({
      "src/main.ts": "export const md001 = 1;\nexport const md = 2;\n",
    });

    await expect(
      service.collect(
        configure({
          exclude: { paths: [], patterns: [/^md\d{3}$/], words: ["md"] },
        }),
      ),
    ).resolves.toStrictEqual(["main", "src"]);
    await expect(
      service.collect(
        configure({ exclude: { paths: [], patterns: [], words: ["md0"] } }),
      ),
    ).resolves.toStrictEqual(["main", "md", "md001", "src"]);
  });

  it("tests a pattern against the folded headword, so a pattern for the singular covers its plural", async () => {
    writeTree({
      "src/main.ts": "const services = 1;\nconst gate = 2;\n",
    });

    await expect(
      service.collect(
        configure({
          exclude: { paths: [], patterns: [/^service$/], words: [] },
        }),
      ),
    ).resolves.toStrictEqual(["gate", "main", "src"]);
  });

  it("tests a pattern against the raw lowercase word, so a pattern written for the plural works too", async () => {
    writeTree({
      "src/main.ts": "const services = 1;\nconst gate = 2;\n",
    });

    await expect(
      service.collect(
        configure({
          exclude: { paths: [], patterns: [/^services$/], words: [] },
        }),
      ),
    ).resolves.toStrictEqual(["gate", "main", "src"]);
  });

  it("tests a pattern against the headword the configured fold gives", async () => {
    writeTree({ "src/main.ts": "const configuration = configure;\n" });

    await expect(
      service.collect(
        configure({
          exclude: { paths: [], patterns: [/^configure$/], words: [] },
          fold: (word) => (word === "configuration" ? "configure" : word),
        }),
      ),
    ).resolves.toStrictEqual(["main", "src"]);
  });

  it("matches the lowercase words case-sensitively unless the pattern is case-insensitive", async () => {
    writeTree({ "src/main.ts": "export const md001 = 1;\n" });

    await expect(
      service.collect(
        configure({
          exclude: { paths: [], patterns: [/^MD\d{3}$/], words: [] },
        }),
      ),
    ).resolves.toStrictEqual(["main", "md001", "src"]);
    await expect(
      service.collect(
        configure({
          exclude: { paths: [], patterns: [/^MD\d{3}$/i], words: [] },
        }),
      ),
    ).resolves.toStrictEqual(["main", "src"]);
  });
});
