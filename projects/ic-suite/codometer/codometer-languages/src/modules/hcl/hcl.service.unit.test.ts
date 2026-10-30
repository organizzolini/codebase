import { writeFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { HclService } from "./hcl.service";

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
    if (filePath.endsWith("throws-a-string.tf")) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw "not an Error";
    }

    return actual.readFileSync(filePath, "utf8");
  });
});

describe(HclService, () => {
  let service: HclService;
  let loggerService: DeepMocked<LoggerService>;

  /** Writes sources into a fresh directory and returns it with their names. */
  function writeSources(files: Record<string, string>): {
    hclFiles: string[];
    workingDirectory: string;
  } {
    const workingDirectory = createTemporaryDirectory("codometer-hcl-");

    for (const [fileName, content] of Object.entries(files)) {
      writeFileSync(path.join(workingDirectory, fileName), content, "utf8");
    }

    return { hclFiles: Object.keys(files), workingDirectory };
  }

  beforeAll(async () => {
    const { instance, logger } = await buildTestingModule(HclService);

    service = instance;
    loggerService = logger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(HclService);

    expect(instance).toBeInstanceOf(HclService);
  });

  it("counts blocks by the kind each one opens", () => {
    const { hclFiles, workingDirectory } = writeSources({
      "main.tf": [
        "# Cluster definition",
        'resource "kubernetes_namespace" "app" {',
        '  name = "app-${var.environment}"',
        "}",
        'variable "environment" {',
        "  type = string",
        "}",
        'output "namespace" {',
        "  value = kubernetes_namespace.app.id",
        "}",
      ].join("\n"),
    });

    const result = service.analyze({ hclFiles, workingDirectory });

    expect(result.files).toBe(1);
    expect(result.blocks).toBe(3);
    expect(result.resources).toBe(1);
    expect(result.variables).toBe(1);
    expect(result.outputs).toBe(1);
    // `name`, `type`, and `value` — one per block.
    expect(result.attributes).toBe(3);
    expect(result.interpolations).toBe(1);
    expect(result.comments).toBe(1);
  });

  it("counts data blocks as resources and leaves other kinds unlabelled", () => {
    const { hclFiles, workingDirectory } = writeSources({
      "data.tf": [
        "terraform {",
        '  required_version = ">= 1.0"',
        "}",
        'data "kubernetes_namespace" "existing" {',
        "  metadata = {}",
        "}",
      ].join("\n"),
    });

    const result = service.analyze({ hclFiles, workingDirectory });

    expect(result.blocks).toBe(2);
    // A `data` block reads a resource; a `terraform` block configures the tool
    // and belongs to none of the named kinds.
    expect(result.resources).toBe(1);
    expect(result.variables).toBe(0);
    expect(result.outputs).toBe(0);
  });

  it("counts a double slash comment as a comment", () => {
    const { hclFiles, workingDirectory } = writeSources({
      "vars.tf": "// alternative comment syntax\n",
    });

    const result = service.analyze({ hclFiles, workingDirectory });

    expect(result.comments).toBe(1);
  });

  it("reports a thrown value that is not an Error", () => {
    const { hclFiles, workingDirectory } = writeSources({
      "throws-a-string.tf": "",
    });

    const result = service.analyze({ hclFiles, workingDirectory });

    expect(result.files).toBe(0);
    expect(loggerService.warn).toHaveBeenCalledWith(
      "🏗️ Skipped HCL analysis",
      undefined,
      { filePath: "throws-a-string.tf", reason: "not an Error" },
    );
  });

  it("skips an unreadable file and warns", () => {
    const result = service.analyze({
      hclFiles: ["missing.tf"],
      workingDirectory: "/repo",
    });

    expect(result.files).toBe(0);
    expect(loggerService.warn).toHaveBeenCalledWith(
      "🏗️ Skipped HCL analysis",
      undefined,
      expect.objectContaining({ filePath: "missing.tf" }),
    );
  });
});
