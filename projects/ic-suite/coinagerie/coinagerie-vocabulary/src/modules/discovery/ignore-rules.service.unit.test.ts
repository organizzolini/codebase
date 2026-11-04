import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { IgnoreRulesService } from "./ignore-rules.service";

import type { IgnoreScope } from "./discovery.types";

const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../../../tmp");

describe(IgnoreRulesService, () => {
  let service: IgnoreRulesService;
  let directory: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [IgnoreRulesService],
    }).compile();

    service = await module.resolve(IgnoreRulesService);
    mkdirSync(TEMPORARY_ROOT, { recursive: true });
    directory = mkdtempSync(path.join(TEMPORARY_ROOT, "ignore-rules-"));
  });

  afterAll(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  function scope(base: string, patterns: string[]): IgnoreScope {
    const filePath = path.join(directory, `${base || "root"}.gitignore`);
    writeFileSync(filePath, `${patterns.join("\n")}\n`);
    const read = service.readScope({ base, filePath });

    if (read === undefined) {
      throw new Error(`Expected a scope from ${filePath}`);
    }

    return read;
  }

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("reads no scope from an ignore file that does not exist", () => {
    expect(
      service.readScope({
        base: "",
        filePath: path.join(directory, "missing.gitignore"),
      }),
    ).toBeUndefined();
  });

  it.each([
    ["a file a pattern names", "debug.log", true],
    ["a file inside an ignored folder", "build/output.js", true],
    ["a folder named with its trailing slash", "build/", true],
    ["a file nothing names", "src/app.ts", false],
    ["a file an inner scope re-includes", "nested/keep.log", false],
    ["a file an inner scope ignores", "nested/drop.md", true],
    ["a file outside the inner scope's base", "drop.md", false],
  ])("judges %s", (_case, relativePath, expected) => {
    const scopes = [
      scope("", ["*.log", "build/"]),
      scope("nested", ["!keep.log", "*.md"]),
    ];

    expect(service.isIgnored(scopes, relativePath)).toBe(expected);
  });
});
