import { createMock } from "@golevelup/ts-vitest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CommentsService } from "../comments/comments.service";
import { CssCommentsService } from "../comments/css-comments.service";
import { HashCommentsService } from "../comments/hash-comments.service";
import { HclCommentsService } from "../comments/hcl-comments.service";
import { LanguageCommentsService } from "../comments/language-comments.service";
import { SqlCommentsService } from "../comments/sql-comments.service";
import { TypescriptCommentsService } from "../comments/typescript-comments.service";
import { YamlCommentsService } from "../comments/yaml-comments.service";
import { CssService } from "../css/css.service";
import { HclService } from "../hcl/hcl.service";
import { JsonService } from "../json/json.service";
import { JupyterService } from "../jupyter/jupyter.service";
import { MarkdownService } from "../markdown/markdown.service";
import { PythonService } from "../python/python.service";
import { ShellService } from "../shell/shell.service";
import { SqlService } from "../sql/sql.service";
import { TomlService } from "../toml/toml.service";
import { TypescriptService } from "../typescript/typescript.service";
import { YamlService } from "../yaml/yaml.service";

import { LanguagesService } from "./languages.service";

import type { CommentCounter } from "../comments/comments.types";
import type { DiscoveredLanguageFiles } from "./languages.types";
import type { ResolvedCodometerConfiguration } from "@codometer/configuration";

const configuration = createMock<ResolvedCodometerConfiguration>({
  python: { command: "uv run python" },
});
const declarationCounter: CommentCounter = {
  budget: {
    maximumCharacters: undefined,
    maximumLines: 6,
    maximumWords: undefined,
    severity: "fail",
  },
  kind: "class",
  label: "class-docs",
  language: undefined,
};
const plainCounter: CommentCounter = {
  budget: {
    maximumCharacters: undefined,
    maximumLines: 4,
    maximumWords: undefined,
    severity: "fail",
  },
  kind: undefined,
  label: "yaml-comments",
  language: "yaml",
};
const commentCounters: CommentCounter[] = [declarationCounter, plainCounter];

const discoveredFiles: DiscoveredLanguageFiles = {
  cssFiles: ["src/styles.css"],
  hclFiles: ["infrastructure/main.tf"],
  jsonFiles: ["package.json"],
  markdownFiles: ["README.md"],
  notebookFiles: ["notebooks/explore.ipynb"],
  pyFiles: ["scripts/check.py"],
  shellFiles: ["scripts/setup.sh"],
  sourceFiles: ["src/app.ts"],
  sqlFiles: ["data/schema.sql"],
  tomlFiles: ["pyproject.toml"],
  yamlFiles: [".github/workflows/ci.yml"],
};

describe(LanguagesService, () => {
  let service: LanguagesService;
  let cssService: CssService;
  let jupyterService: JupyterService;
  let pythonService: PythonService;
  let yamlService: YamlService;

  beforeAll(async () => {
    const { instance, mock } = await buildTestingModule(LanguagesService, {
      mocks: [
        CssService,
        HclService,
        JsonService,
        JupyterService,
        MarkdownService,
        PythonService,
        ShellService,
        SqlService,
        TomlService,
        TypescriptService,
        YamlService,
      ],
      providers: [
        CommentsService,
        CssCommentsService,
        HashCommentsService,
        HclCommentsService,
        LanguageCommentsService,
        SqlCommentsService,
        TypescriptCommentsService,
        YamlCommentsService,
      ],
    });

    service = instance;
    cssService = mock(CssService);
    jupyterService = mock(JupyterService);
    pythonService = mock(PythonService);
    yamlService = mock(YamlService);
  });

  beforeEach(() => {
    service.analyze({
      commentCounters,
      configuration,
      discoveredFiles,
      symbolCounters: [],
      workingDirectory: "/repo",
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(LanguagesService, {
      mocks: [
        CssService,
        HclService,
        JsonService,
        JupyterService,
        MarkdownService,
        PythonService,
        ShellService,
        SqlService,
        TomlService,
        TypescriptService,
        YamlService,
      ],
      providers: [
        CommentsService,
        CssCommentsService,
        HashCommentsService,
        HclCommentsService,
        LanguageCommentsService,
        SqlCommentsService,
        TypescriptCommentsService,
        YamlCommentsService,
      ],
    });

    expect(instance).toBeInstanceOf(LanguagesService);
  });

  it("gives each analyzer only the files of its own language", () => {
    expect(cssService.analyze).toHaveBeenCalledWith({
      cssFiles: ["src/styles.css"],
      workingDirectory: "/repo",
    });
    expect(yamlService.analyze).toHaveBeenCalledWith({
      workingDirectory: "/repo",
      yamlFiles: [".github/workflows/ci.yml"],
    });
  });

  it("passes the configured interpreter to both Python readers", () => {
    // The notebook analyzer runs the same interpreter over its code cells.
    expect(pythonService.analyze).toHaveBeenCalledWith({
      command: "uv run python",
      pythonFiles: ["scripts/check.py"],
      workingDirectory: "/repo",
    });
    expect(jupyterService.analyze).toHaveBeenCalledWith({
      notebookFiles: ["notebooks/explore.ipynb"],
      pythonCommand: "uv run python",
      workingDirectory: "/repo",
    });
  });

  it("hands every counter to both the comment readers and typescript", async () => {
    const { instance, mock } = await buildTestingModule(LanguagesService, {
      mocks: [
        LanguageCommentsService,
        CssService,
        HclService,
        JsonService,
        JupyterService,
        MarkdownService,
        PythonService,
        ShellService,
        SqlService,
        TomlService,
        TypescriptService,
        YamlService,
      ],
    });
    const isolatedService = instance;
    const isolatedLanguageComments = mock(LanguageCommentsService);
    const isolatedTypescriptService = mock(TypescriptService);

    isolatedService.analyze({
      commentCounters,
      configuration,
      discoveredFiles,
      symbolCounters: [],
      workingDirectory: "/repo",
    });

    expect(isolatedTypescriptService.analyze).toHaveBeenCalledWith(
      expect.objectContaining({ commentCounters }),
    );
    expect(isolatedLanguageComments.measure).toHaveBeenCalledWith(
      expect.objectContaining({ counters: commentCounters }),
    );
  });

  it("reports one entry per language", () => {
    const results = service.analyze({
      commentCounters,
      configuration,
      discoveredFiles,
      symbolCounters: [],
      workingDirectory: "/repo",
    });

    expect(Object.keys(results).toSorted()).toStrictEqual([
      "commentCounts",
      "css",
      "hcl",
      "json",
      "jupyter",
      "markdown",
      "python",
      "shell",
      "sql",
      "toml",
      "typescript",
      "yaml",
    ]);
  });
});
