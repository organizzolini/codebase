import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { DEFAULT_INCLUDE } from "@coinagerie/configuration";
import { LanguagesModule } from "@coinagerie/languages";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DiscoveryModule } from "../discovery/discovery.module";
import { FoldingModule } from "../folding/folding.module";
import { WordsModule } from "../words/words.module";

import { VocabularyService } from "./vocabulary.service";

import type { ResolvedCoinagerieConfiguration } from "@coinagerie/configuration";

const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../../../tmp");

describe(VocabularyService, () => {
  let service: VocabularyService;
  let root: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DiscoveryModule, FoldingModule, LanguagesModule, WordsModule],
      providers: [VocabularyService],
    }).compile();

    service = await module.resolve(VocabularyService);
  });

  beforeEach(() => {
    mkdirSync(TEMPORARY_ROOT, { recursive: true });
    root = mkdtempSync(path.join(TEMPORARY_ROOT, "vocabulary-"));
    mkdirSync(path.join(root, ".git"));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
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
      exclude: { paths: [], words: [] },
      fold: undefined,
      include: [...DEFAULT_INCLUDE],
      outputs: [],
      ...overrides,
    };
  }

  it("is defined", () => {
    expect(service).toBeDefined();
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
          exclude: { paths: ["**/*.test.ts"], words: [] },
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
        configure({ exclude: { paths: [], words: ["service"] } }),
      ),
    ).resolves.toStrictEqual(["gate", "main", "src"]);
  });

  it("excludes a word named by one of its forms, in any case", async () => {
    writeTree({ "src/main.ts": "const gate = service + implement;\n" });

    await expect(
      service.collect(
        configure({
          exclude: { paths: [], words: ["Services", "implements"] },
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
          exclude: { paths: [], words: ["configuration"] },
          fold,
        }),
      ),
    ).resolves.toStrictEqual(["main", "src"]);
  });
});
