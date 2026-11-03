import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { DEFAULT_INCLUDE } from "@coinagerie/configuration";
import { LanguagesModule } from "@coinagerie/languages";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DiscoveryModule } from "../discovery/discovery.module";
import { WordsModule } from "../words/words.module";

import { VocabularyService } from "./vocabulary.service";

import type { ResolvedCoinagerieConfiguration } from "@coinagerie/configuration";

const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../../../tmp");

describe(VocabularyService, () => {
  let service: VocabularyService;
  let root: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DiscoveryModule, LanguagesModule, WordsModule],
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
      exclude: { paths: [] },
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
      "notes",
      "phase",
      "readme",
      "service",
      "src",
    ]);
  });

  it("scans only what the configuration includes and does not exclude", async () => {
    writeTree({
      "src/kept.ts": "const keptName = 1;\n",
      "src/left.test.ts": "const leftName = 1;\n",
      "vendor/other.ts": "const otherName = 1;\n",
    });

    await expect(
      service.collect(
        configure({
          exclude: { paths: ["**/*.test.ts"] },
          include: ["src/**"],
        }),
      ),
    ).resolves.toStrictEqual(["kept", "name", "src"]);
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
});
