import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ConfigurationModule,
  ConfigurationService,
} from "@conformetry/configuration";
import { beforeAll, describe, expect, it } from "vitest";

import {
  createTemporaryDirectory,
  useTemporaryDirectory,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { DifferencesModule } from "../differences/differences.module";

import { FilesService } from "./files.service";

import type {
  MatchedInstance,
  TemplateDefinition,
} from "@conformetry/configuration";

/**
 * Writes a template with one root file and two files in a nested folder, so a
 * partially present instance leaves two files sharing one missing directory.
 */
async function createNestedTemplatePath(): Promise<string> {
  const templatePath = path.join(
    createTemporaryDirectory("files-nested"),
    "widget",
  );

  await mkdir(path.join(templatePath, "nested"), { recursive: true });
  await writeFile(
    path.join(templatePath, "{{nameKebabCase}}.service.ts"),
    "",
    "utf8",
  );
  await writeFile(path.join(templatePath, "nested", ".gitignore"), "", "utf8");
  await writeFile(path.join(templatePath, "nested", "notes.md"), "", "utf8");

  return templatePath;
}

/** Writes a flat two-file template and returns its folder. */
async function createTemplatePath(templatesRoot: string): Promise<string> {
  const templatePath = path.join(templatesRoot, "widget");

  await mkdir(path.join(templatePath, "nested"), { recursive: true });
  await writeFile(
    path.join(templatePath, "{{nameKebabCase}}.service.ts"),
    "",
    "utf8",
  );
  await writeFile(path.join(templatePath, "nested", ".gitignore"), "", "utf8");

  return templatePath;
}

describe(FilesService, () => {
  const readTemplatesRoot = useTemporaryDirectory("files-templates");
  let configurationService: ConfigurationService;
  let service: FilesService;
  let template: TemplateDefinition;

  /** Matches an instance path against the single `widget` template. */
  function matchInstance(instancePath: string): MatchedInstance[] {
    const { matched } = configurationService.matchInstances({
      instances: [{ nameStem: "my-widget", path: instancePath }],
      templates: [template],
    });

    return matched;
  }

  beforeAll(async () => {
    const built = await buildTestingModule(FilesService, {
      imports: [ConfigurationModule, DifferencesModule],
    });

    service = built.instance;
    configurationService = await built.module.resolve(ConfigurationService);
    template = configurationService.collectTemplate({
      name: "widget",
      templatePath: await createTemplatePath(readTemplatesRoot()),
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(FilesService, {
      imports: [ConfigurationModule, DifferencesModule],
    });

    expect(instance).toBeInstanceOf(FilesService);
  });

  it("reports nothing when the instance has every template file", async () => {
    const instancePath = createTemporaryDirectory("files-complete");

    await mkdir(path.join(instancePath, "nested"), { recursive: true });
    await writeFile(
      path.join(instancePath, "my-widget.service.ts"),
      "",
      "utf8",
    );
    await writeFile(
      path.join(instancePath, "nested", ".gitignore"),
      "",
      "utf8",
    );

    expect(
      service.checkInstanceFiles({ instances: matchInstance(instancePath) })
        .fileResults,
    ).toStrictEqual([]);
  });

  it("reports nothing when no instance matched", () => {
    expect(
      service.checkInstanceFiles({ instances: [] }).fileResults,
    ).toStrictEqual([]);
  });

  it("reports nothing when the matched template declares no files", () => {
    const emptyTemplate = configurationService.collectTemplate({
      name: "empty",
      templatePath: createTemporaryDirectory("files-empty-template"),
    });
    const instancePath = createTemporaryDirectory("files-empty-instance");
    // A matched instance whose template declares no files at all — nothing
    // routes here through `matchInstances`, but resolving it should still be
    // a no-op rather than an error.
    const matched: MatchedInstance[] = [
      {
        instance: { nameStem: "my-widget", path: instancePath },
        matchedFileCount: 0,
        substitutions: {},
        template: emptyTemplate,
      },
    ];

    expect(
      service.checkInstanceFiles({ instances: matched }).fileResults,
    ).toStrictEqual([]);
  });

  it("reports an extension-less file the template requires", async () => {
    const instancePath = createTemporaryDirectory("files-partial");

    await mkdir(path.join(instancePath, "nested"), { recursive: true });
    await writeFile(
      path.join(instancePath, "my-widget.service.ts"),
      "",
      "utf8",
    );

    const { fileResults: results } = service.checkInstanceFiles({
      instances: matchInstance(instancePath),
    });

    expect(results.map((result) => result.filename)).toStrictEqual([
      ".gitignore",
    ]);
    expect(results[0]?.differences[0]?.differenceType).toBe("file");
    expect(results[0]?.differences[0]?.fix).toContain("Create the");
  });

  it("reports a missing directory once however many files it holds", async () => {
    const nestedTemplate = configurationService.collectTemplate({
      name: "widget",
      templatePath: await createNestedTemplatePath(),
    });
    const instancePath = createTemporaryDirectory("files-nested-instance");

    // Present, so the template matches; the nested folder is absent.
    await writeFile(
      path.join(instancePath, "my-widget.service.ts"),
      "",
      "utf8",
    );

    const { matched } = configurationService.matchInstances({
      instances: [{ nameStem: "my-widget", path: instancePath }],
      templates: [nestedTemplate],
    });
    const { fileResults: results } = service.checkInstanceFiles({
      instances: matched,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.differences[0]?.differenceType).toBe("directory");
  });

  it("collapses a missing directory into one finding", async () => {
    const instancePath = createTemporaryDirectory("files-missing");

    await writeFile(
      path.join(instancePath, "my-widget.service.ts"),
      "",
      "utf8",
    );

    const { fileResults: results } = service.checkInstanceFiles({
      instances: matchInstance(instancePath),
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.differences[0]?.differenceType).toBe("directory");
  });
});
