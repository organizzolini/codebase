import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  BoundaryOutcomeReportService,
  BoundaryReportService,
} from "@codependix/boundaries";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { captureOutput, createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { AnchorsService } from "../anchors/anchors.service";

import { CombinedOutputService } from "./combined-output.service";

import type { CombinedGraphExports } from "../graph-run/graph-run.types";
import type { CapturedOutput } from "@codebase/testing";
import type { BoundaryReportArguments } from "@codependix/boundaries";

describe(CombinedOutputService, () => {
  let service: CombinedOutputService;
  let workingDirectory: string;
  let output: CapturedOutput;

  const GRAPHS: CombinedGraphExports = {
    fileImports: {
      json: { edges: [], fileNames: [] },
      markdown: "```mermaid\nfile-imports\n```",
    },
    nxProjects: {
      json: { projectNames: [] },
      markdown: "```mermaid\nnx-projects\n```",
    },
  };

  const BOUNDARIES: BoundaryReportArguments = {
    judgedProjects: ["b", "a"],
    outcome: {
      failures: [
        {
          error: "Cannot access 'Word' before initialization",
          level: "nestjsModules",
          ownerProject: "c",
          projects: ["a"],
          verdict: "fail",
        },
      ],
      violations: [
        {
          cycle: ["x", "y", "x"],
          level: "nxProjects",
          message: "no-cycles: x → y → x is a cycle.",
          projects: ["x", "y"],
          rule: "no-cycles",
          scope: "workspace",
          source: "y",
          target: "x",
          verdict: "note",
        },
      ],
    },
  };

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(CombinedOutputService, {
      providers: [
        AnchorsService,
        BoundaryOutcomeReportService,
        BoundaryReportService,
      ],
    }));
  });

  beforeEach(() => {
    workingDirectory = createTemporaryDirectory("combined-output-service");
    output = captureOutput();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(CombinedOutputService, {
      providers: [
        AnchorsService,
        BoundaryOutcomeReportService,
        BoundaryReportService,
      ],
    });

    expect(instance).toBeInstanceOf(CombinedOutputService);
  });

  describe("resolveFormat", () => {
    it("defaults to markdown when the flag was left off entirely", () => {
      expect(service.resolveFormat(undefined)).toStrictEqual({
        errors: [],
        format: "markdown",
      });
    });

    it("accepts json", () => {
      expect(service.resolveFormat("json")).toStrictEqual({
        errors: [],
        format: "json",
      });
    });

    it("accepts markdown", () => {
      expect(service.resolveFormat("markdown")).toStrictEqual({
        errors: [],
        format: "markdown",
      });
    });

    it("rejects an unknown value, falling back to markdown", () => {
      expect(service.resolveFormat("yaml")).toStrictEqual({
        errors: [
          '--format does not accept "yaml". It takes one of "json" and "markdown", as in "--format markdown".',
        ],
        format: "markdown",
      });
    });
  });

  describe("run", () => {
    it("prints the combined graphs as JSON to standard output when --format json", () => {
      service.run({
        format: "json",
        graphs: GRAPHS,
        jsonOutputPath: undefined,
        markdownOutputPath: undefined,
        workingDirectory,
      });

      expect(output.stdout()).toContain('"fileImports"');
      expect(output.stdout()).toContain('"nxProjects"');
    });

    it("prints the combined graphs as an anchor-spliced Markdown document when --format markdown", () => {
      service.run({
        format: "markdown",
        graphs: GRAPHS,
        jsonOutputPath: undefined,
        markdownOutputPath: undefined,
        workingDirectory,
      });

      expect(output.stdout()).toContain("## 🕸️ Codependix");
      expect(output.stdout()).toContain("file-imports");
      expect(output.stdout()).toContain("nx-projects");
    });

    it("writes every active graph type's data to --json-output, keyed by graph type", async () => {
      service.run({
        format: "markdown",
        graphs: GRAPHS,
        jsonOutputPath: "combined.json",
        markdownOutputPath: undefined,
        workingDirectory,
      });

      const written = JSON.parse(
        await readFile(path.join(workingDirectory, "combined.json"), "utf8"),
      ) as unknown;

      expect(written).toStrictEqual({
        fileImports: { edges: [], fileNames: [] },
        nxProjects: { projectNames: [] },
      });
    });

    it("writes every active graph type's own anchor-spliced section to --markdown-output", async () => {
      service.run({
        format: "markdown",
        graphs: GRAPHS,
        jsonOutputPath: undefined,
        markdownOutputPath: "combined.md",
        workingDirectory,
      });

      const written = await readFile(
        path.join(workingDirectory, "combined.md"),
        "utf8",
      );

      expect(written).toContain("## 🕸️ Codependix");
      expect(written).toContain('name="fileImports"');
      expect(written).toContain('name="nxProjects"');
      expect(written).toContain("file-imports");
      expect(written).toContain("nx-projects");
    });

    it("writes nothing to a combined destination whose flag was not given", async () => {
      service.run({
        format: "markdown",
        graphs: GRAPHS,
        jsonOutputPath: undefined,
        markdownOutputPath: undefined,
        workingDirectory,
      });

      await expect(
        readFile(path.join(workingDirectory, "combined.json"), "utf8"),
      ).rejects.toThrow("ENOENT");
      await expect(
        readFile(path.join(workingDirectory, "combined.md"), "utf8"),
      ).rejects.toThrow("ENOENT");
    });

    it("still prints and writes an empty object or document when no graph type is active", async () => {
      service.run({
        format: "json",
        graphs: {},
        jsonOutputPath: "combined.json",
        markdownOutputPath: "combined.md",
        workingDirectory,
      });

      expect(output.stdout()).toBe("{}\n");

      const writtenJson = await readFile(
        path.join(workingDirectory, "combined.json"),
        "utf8",
      );
      const writtenMarkdown = await readFile(
        path.join(workingDirectory, "combined.md"),
        "utf8",
      );

      expect(writtenJson.trim()).toBe("{}");
      expect(writtenMarkdown.trim()).toBe("");
    });

    describe("with a boundary check's findings", () => {
      it("prints the findings under a boundaries key beside the graph types", () => {
        service.run({
          boundaries: BOUNDARIES,
          format: "json",
          graphs: GRAPHS,
          jsonOutputPath: undefined,
          markdownOutputPath: undefined,
          workingDirectory,
        });

        const printed = JSON.parse(output.stdout()) as Record<string, unknown>;

        expect(Object.keys(printed)).toStrictEqual([
          "fileImports",
          "nxProjects",
          "boundaries",
        ]);
        expect(printed["boundaries"]).toStrictEqual({
          failures: [
            {
              error: "Cannot access 'Word' before initialization",
              level: "nestjsModules",
              ownerProject: "c",
              projects: ["a"],
              verdict: "fail",
            },
          ],
          judgedProjects: ["a", "b"],
          violations: [
            {
              cycle: ["x", "y", "x"],
              level: "nxProjects",
              message: "no-cycles: x → y → x is a cycle.",
              projects: ["x", "y"],
              rule: "no-cycles",
              source: "y",
              target: "x",
              verdict: "note",
            },
          ],
        });
      });

      it("prints only the boundaries key for a run that exported nothing", () => {
        service.run({
          boundaries: BOUNDARIES,
          format: "json",
          graphs: {},
          jsonOutputPath: undefined,
          markdownOutputPath: undefined,
          workingDirectory,
        });

        const printed = JSON.parse(output.stdout()) as Record<string, unknown>;

        expect(Object.keys(printed)).toStrictEqual(["boundaries"]);
      });

      it("prints a Boundaries section after the graph types' sections", () => {
        service.run({
          boundaries: BOUNDARIES,
          format: "markdown",
          graphs: GRAPHS,
          jsonOutputPath: undefined,
          markdownOutputPath: undefined,
          workingDirectory,
        });

        const printed = output.stdout();

        expect(printed).toContain("### Boundaries");
        expect(printed).toContain(
          '<!-- codependix:start name="boundaries" -->',
        );
        expect(printed).toContain("Judged projects: a, b.");
        expect(printed).toContain(
          "- **fail** nestjsModules a: Cannot access 'Word' before initialization (failed in code owned by c)",
        );
        expect(printed).toContain(
          "- **note** nxProjects in dependency x, y, not failing: no-cycles: x → y → x is a cycle.",
        );
        expect(printed.indexOf("### Boundaries")).toBeGreaterThan(
          printed.indexOf("### Nx Neighborhood"),
        );
      });

      it("writes the boundaries to --json-output and --markdown-output", async () => {
        service.run({
          boundaries: BOUNDARIES,
          format: "json",
          graphs: {},
          jsonOutputPath: "combined.json",
          markdownOutputPath: "combined.md",
          workingDirectory,
        });

        const writtenJson = JSON.parse(
          await readFile(path.join(workingDirectory, "combined.json"), "utf8"),
        ) as Record<string, unknown>;
        const writtenMarkdown = await readFile(
          path.join(workingDirectory, "combined.md"),
          "utf8",
        );

        expect(Object.keys(writtenJson)).toStrictEqual(["boundaries"]);
        expect(writtenMarkdown).toContain("## 🕸️ Codependix");
        expect(writtenMarkdown).toContain("### Boundaries");
      });
    });
  });
});
