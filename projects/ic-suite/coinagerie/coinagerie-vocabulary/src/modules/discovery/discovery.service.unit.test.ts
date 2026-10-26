import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { DEFAULT_INCLUDE } from "@coinagerie/configuration";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DiscoveryService } from "./discovery.service";
import { IgnoreRulesService } from "./ignore-rules.service";

const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../../../tmp");

describe(DiscoveryService, () => {
  let service: DiscoveryService;
  let root: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [DiscoveryService, IgnoreRulesService],
    }).compile();

    service = await module.resolve(DiscoveryService);
  });

  beforeEach(() => {
    mkdirSync(TEMPORARY_ROOT, { recursive: true });
    root = mkdtempSync(path.join(TEMPORARY_ROOT, "discovery-"));
    // Every tree is its own repository, so the `tmp` pattern in this
    // workspace's own `.gitignore` never reaches it.
    mkdirSync(path.join(root, ".git"));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  /** Writes files, keyed by path relative to the temporary root. */
  function writeTree(files: Record<string, string>): void {
    for (const [relativePath, contents] of Object.entries(files)) {
      const absolutePath = path.join(root, relativePath);
      mkdirSync(path.dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, contents);
    }
  }

  function discover(
    overrides: {
      directory?: string;
      exclude?: string[];
      include?: string[];
      skip?: string[];
    } = {},
  ): string[] {
    return service.discover({
      directory: overrides.directory ?? root,
      exclude: overrides.exclude ?? [],
      include: overrides.include ?? [...DEFAULT_INCLUDE],
      skip: overrides.skip ?? [],
    });
  }

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("lists every file, dot-files included, sorted and relative to the root", () => {
    writeTree({
      ".github/workflows/build.yml": "",
      ".gitignore": "",
      "b.ts": "",
      "src/a.ts": "",
    });

    expect(discover()).toStrictEqual([
      ".github/workflows/build.yml",
      ".gitignore",
      "b.ts",
      "src/a.ts",
    ]);
  });

  it("honors every .gitignore inside the root, the innermost deciding", () => {
    writeTree({
      ".gitignore": "*.log\nbuild/\n",
      "build/out.js": "",
      "debug.log": "",
      "nested/.gitignore": "!keep.log\n",
      "nested/keep.log": "",
      "src/a.ts": "",
    });

    expect(discover()).toStrictEqual([
      ".gitignore",
      "nested/.gitignore",
      "nested/keep.log",
      "src/a.ts",
    ]);
  });

  it("honors a .gitignore above the root, up to the repository root", () => {
    writeTree({
      ".git/HEAD": "",
      ".gitignore": "generated/\n",
      "packages/project/generated/thing.ts": "",
      "packages/project/src/a.ts": "",
    });

    expect(
      discover({ directory: path.join(root, "packages/project") }),
    ).toStrictEqual(["src/a.ts"]);
  });

  it("treats the root as the repository root outside any repository", () => {
    // The one tree written outside the workspace: nothing inside it can be
    // outside a repository, and no process is spawned against it.
    const outside = mkdtempSync(path.join(tmpdir(), "coinagerie-discovery-"));

    try {
      writeFileSync(path.join(outside, ".gitignore"), "*.log\n");
      writeFileSync(path.join(outside, "debug.log"), "");
      writeFileSync(path.join(outside, "kept.ts"), "");

      expect(discover({ directory: outside })).toStrictEqual([
        ".gitignore",
        "kept.ts",
      ]);
    } finally {
      rmSync(outside, { force: true, recursive: true });
    }
  });

  it("never reads a .gitignore above the repository root", () => {
    writeTree({
      ".gitignore": "*\n",
      "repository/.git/HEAD": "",
      "repository/a.ts": "",
    });

    expect(
      discover({ directory: path.join(root, "repository") }),
    ).toStrictEqual(["a.ts"]);
  });

  it("skips the .git folder and every symbolic link", () => {
    writeTree({ ".git/config": "", "AGENTS.md": "", "src/a.ts": "" });
    symlinkSync(path.join(root, "AGENTS.md"), path.join(root, "CLAUDE.md"));
    symlinkSync(path.join(root, "src"), path.join(root, "linked"));

    expect(discover()).toStrictEqual(["AGENTS.md", "src/a.ts"]);
  });

  it("keeps only what include names, then drops what exclude names", () => {
    writeTree({
      "docs/guide.md": "",
      "src/a.test.ts": "",
      "src/a.ts": "",
      "src/deep/b.ts": "",
      "vendor/c.ts": "",
    });

    expect(
      discover({
        exclude: ["**/*.test.ts", "vendor/**"],
        include: ["**/*.ts"],
      }),
    ).toStrictEqual(["src/a.ts", "src/deep/b.ts"]);
  });

  it("leaves out everything in a folder an exclusion names outright", () => {
    writeTree({
      "dist/bundle.js": "",
      "packages/one/node_modules/library/index.js": "",
      "packages/one/src/a.ts": "",
    });

    expect(discover({ exclude: ["dist", "**/node_modules"] })).toStrictEqual([
      "packages/one/src/a.ts",
    ]);
  });

  it("leaves out the files a run writes", () => {
    writeTree({ "GLOSSARY.md": "", "README.md": "" });

    expect(discover({ skip: [path.join(root, "GLOSSARY.md")] })).toStrictEqual([
      "README.md",
    ]);
  });
});
