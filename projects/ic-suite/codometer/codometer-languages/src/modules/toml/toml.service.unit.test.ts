import { writeFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TomlService } from "./toml.service";

import type { LoggerService } from "@codebase/observability";
import type { DeepMocked } from "@golevelup/ts-vitest";
import type * as NodeFileSystem from "node:fs";

// Reads stay real except for one sentinel path, which throws a bare string:
// a rejected promise or a thrown literal is not an Error, and the analyzer
// still has to report which file it gave up on.
vi.mock("node:fs", async (importOriginal) => {
  const { mockFileSystem } = await import("@codebase/testing/mocks");
  const actual = await importOriginal<typeof NodeFileSystem>();

  return mockFileSystem(actual, (filePath) => {
    if (filePath.endsWith("throws-a-string.toml")) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw "not an Error";
    }

    return actual.readFileSync(filePath, "utf8");
  });
});

describe(TomlService, () => {
  let service: TomlService;
  let loggerService: DeepMocked<LoggerService>;

  /** Writes sources into a fresh directory and returns it with their names. */
  function writeSources(files: Record<string, string>): {
    tomlFiles: string[];
    workingDirectory: string;
  } {
    const workingDirectory = createTemporaryDirectory("codometer-toml-");

    for (const [fileName, content] of Object.entries(files)) {
      writeFileSync(path.join(workingDirectory, fileName), content, "utf8");
    }

    return { tomlFiles: Object.keys(files), workingDirectory };
  }

  beforeAll(async () => {
    const { instance, logger } = await buildTestingModule(TomlService);

    service = instance;
    loggerService = logger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(TomlService);

    expect(instance).toBeInstanceOf(TomlService);
  });

  it("counts tables, keys, and arrays", () => {
    const { tomlFiles, workingDirectory } = writeSources({
      "pyproject.toml": [
        "# Project metadata",
        "[project]",
        'name = "codebase"',
        "dependencies = [",
        '  "pydantic",',
        "]",
        "[[tool.uv.index]]",
        'url = "https://pypi.org"',
      ].join("\n"),
    });

    const result = service.analyze({ tomlFiles, workingDirectory });

    expect(result.files).toBe(1);
    expect(result.tables).toBe(1);
    expect(result.arrayTables).toBe(1);
    expect(result.keys).toBe(3);
    expect(result.arrays).toBe(1);
    expect(result.comments).toBe(1);
  });

  it("reads a hash inside a multi-line string as content", () => {
    const { tomlFiles, workingDirectory } = writeSources({
      "docs.toml": [
        'description = """',
        "# not a comment",
        "[not a table]",
        '"""',
        "after = 1",
      ].join("\n"),
    });

    const result = service.analyze({ tomlFiles, workingDirectory });

    expect(result.comments).toBe(0);
    expect(result.tables).toBe(0);
    expect(result.keys).toBe(2);
  });

  it("ignores a line that assigns nothing", () => {
    const { tomlFiles, workingDirectory } = writeSources({
      "sparse.toml": "[table]\n\nbare-word-with-no-assignment\n",
    });

    const result = service.analyze({ tomlFiles, workingDirectory });

    expect(result.tables).toBe(1);
    expect(result.keys).toBe(0);
  });

  it("reports a thrown value that is not an Error", () => {
    const { tomlFiles, workingDirectory } = writeSources({
      "throws-a-string.toml": "",
    });

    const result = service.analyze({ tomlFiles, workingDirectory });

    expect(result.files).toBe(0);
    expect(loggerService.warn).toHaveBeenCalledWith(
      "🧰 Skipped TOML analysis",
      undefined,
      { filePath: "throws-a-string.toml", reason: "not an Error" },
    );
  });

  it("skips an unreadable file and warns", () => {
    const result = service.analyze({
      tomlFiles: ["missing.toml"],
      workingDirectory: "/repo",
    });

    expect(result.files).toBe(0);
    expect(loggerService.warn).toHaveBeenCalledWith(
      "🧰 Skipped TOML analysis",
      undefined,
      expect.objectContaining({ filePath: "missing.toml" }),
    );
  });
});
