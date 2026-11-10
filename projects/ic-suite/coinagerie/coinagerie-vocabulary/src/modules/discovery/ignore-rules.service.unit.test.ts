import { writeFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { useTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { IgnoreRulesService } from "./ignore-rules.service";

import type { IgnoreScope } from "./discovery.types";

describe(IgnoreRulesService, () => {
  let service: IgnoreRulesService;
  const directory = useTemporaryDirectory("ignore-rules");

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(IgnoreRulesService));
  });

  function scope(base: string, patterns: string[]): IgnoreScope {
    const filePath = path.join(directory(), `${base || "root"}.gitignore`);
    writeFileSync(filePath, `${patterns.join("\n")}\n`);
    const read = service.readScope({ base, filePath });

    if (read === undefined) {
      throw new Error(`Expected a scope from ${filePath}`);
    }

    return read;
  }

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(IgnoreRulesService);

    expect(instance).toBeInstanceOf(IgnoreRulesService);
  });

  it("reads no scope from an ignore file that does not exist", () => {
    expect(
      service.readScope({
        base: "",
        filePath: path.join(directory(), "missing.gitignore"),
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
