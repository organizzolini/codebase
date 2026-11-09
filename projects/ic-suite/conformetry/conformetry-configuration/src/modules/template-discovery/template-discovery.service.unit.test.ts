import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import {
  createTemporaryDirectory,
  useTemporaryDirectory,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderingService } from "../rendering/rendering.service";

import { TemplateDiscoveryService } from "./template-discovery.service";

import type { TemplateDefinition } from "./template-discovery.types";

const SUBSTITUTIONS = {
  nameKebabCase: "my-widget",
  namePascalCase: "MyWidget",
};

/**
 * Writes a template that produces a folder: its whole tree sits under
 * `{{nameKebabCase}}/`, so the template itself says an instance is a folder.
 */
async function createTemplatePath(templatesRoot: string): Promise<string> {
  const templatePath = path.join(templatesRoot, "example");

  await mkdir(path.join(templatePath, "{{nameKebabCase}}", "src"), {
    recursive: true,
  });
  await writeFile(
    path.join(templatePath, "{{nameKebabCase}}", "README.md"),
    "# {{namePascalCase}}\n",
    "utf8",
  );
  await writeFile(
    path.join(
      templatePath,
      "{{nameKebabCase}}",
      "src",
      "{{nameKebabCase}}.service.ts",
    ),
    "export class {{namePascalCase}}Service {}\n",
    "utf8",
  );

  return templatePath;
}

describe(TemplateDiscoveryService, () => {
  const readTemplatesRoot = useTemporaryDirectory("templates");
  let service: TemplateDiscoveryService;
  let template: TemplateDefinition;

  beforeAll(async () => {
    const built = await buildTestingModule(TemplateDiscoveryService, {
      providers: [RenderingService],
    });

    service = built.instance;
    template = service.collectTemplate({
      name: "example",
      templatePath: await createTemplatePath(readTemplatesRoot()),
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(TemplateDiscoveryService, {
      providers: [RenderingService],
    });

    expect(instance).toBeInstanceOf(TemplateDiscoveryService);
  });

  describe("collectTemplate", () => {
    it("reads every file in the template folder", () => {
      expect(template.name).toBe("example");
      expect(
        template.filePaths.map((filePath) => path.basename(filePath)),
      ).toStrictEqual(["README.md", "{{nameKebabCase}}.service.ts"]);
    });

    it("carries a declared threshold onto the template", () => {
      expect(
        service.collectTemplate({
          name: "example",
          templatePath: "/does/not/exist",
          threshold: 0.85,
        }).threshold,
      ).toBe(0.85);
    });

    it("leaves the threshold unset when the generator declares none", () => {
      // Unset rather than defaulted, so a run-level flag still applies.
      expect(template.threshold).toBeUndefined();
    });

    it("returns no files when the template folder does not exist", () => {
      expect(
        service.collectTemplate({
          name: "missing",
          templatePath: "/does/not/exist",
        }).filePaths,
      ).toStrictEqual([]);
    });
  });

  describe("collectTemplates", () => {
    it("reads every generator's template folder in one pass", async () => {
      const templatePath = await createTemplatePath(
        createTemporaryDirectory("templates"),
      );

      const templates = service.collectTemplates({
        configuration: [
          {
            inputs: {},
            instances: [],
            name: "example",
            templatePath: path.basename(templatePath),
          },
        ],
        workingDirectory: path.dirname(templatePath),
      });

      expect(templates).toHaveLength(1);
      expect(templates[0]?.filePaths).toHaveLength(2);
    });

    // A configured path is relative to the workspace, not to whatever directory
    // the host happened to be started from.
    it("resolves a configured template path against the working directory", async () => {
      const templatePath = await createTemplatePath(
        createTemporaryDirectory("templates"),
      );

      const templates = service.collectTemplates({
        configuration: [
          {
            inputs: {},
            instances: [],
            name: "example",
            templatePath: path.basename(templatePath),
          },
        ],
        workingDirectory: path.dirname(templatePath),
      });

      expect(templates[0]?.directoryPath).toBe(templatePath);
    });

    it("carries a generator's declared threshold onto its template", async () => {
      const templatePath = await createTemplatePath(
        createTemporaryDirectory("templates"),
      );

      const templates = service.collectTemplates({
        configuration: [
          {
            inputs: {},
            instances: [],
            name: "example",
            templatePath,
            threshold: 0.8,
          },
        ],
        workingDirectory: path.dirname(templatePath),
      });

      expect(templates[0]?.threshold).toBe(0.8);
    });
  });

  describe("resolveInstanceFilePath", () => {
    it("lays the template's tree over the instance path", () => {
      expect(
        service.resolveInstanceFilePath({
          instancePath: "/project/src/modules",
          substitutions: SUBSTITUTIONS,
          templateDirectoryPath: template.directoryPath,
          templateFilePath: path.join(
            template.directoryPath,
            "{{nameKebabCase}}",
            "src",
            "{{nameKebabCase}}.service.ts",
          ),
        }),
      ).toBe(
        path.join(
          "/project/src/modules",
          "my-widget",
          "src",
          "my-widget.service.ts",
        ),
      );
    });
  });

  describe("countMatchingFiles", () => {
    it("counts only files the instance path already has", async () => {
      const instancePath = createTemporaryDirectory("instance");

      await mkdir(path.join(instancePath, "my-widget"), { recursive: true });
      await writeFile(
        path.join(instancePath, "my-widget", "README.md"),
        "# MyWidget\n",
        "utf8",
      );

      expect(
        service.countMatchingFiles({
          instancePath,
          substitutions: SUBSTITUTIONS,
          template,
        }),
      ).toBe(1);
    });

    it("counts only files inside the given scope", async () => {
      const instancePath = createTemporaryDirectory("instance");
      const readmePath = path.join(instancePath, "my-widget", "README.md");

      await mkdir(path.join(instancePath, "my-widget", "src"), {
        recursive: true,
      });
      await writeFile(readmePath, "# MyWidget\n", "utf8");
      await writeFile(
        path.join(instancePath, "my-widget", "src", "my-widget.service.ts"),
        "",
        "utf8",
      );

      expect(
        service.countMatchingFiles({
          fileScope: [readmePath],
          instancePath,
          substitutions: SUBSTITUTIONS,
          template,
        }),
      ).toBe(1);
    });
  });

  describe("prepareDocument", () => {
    it("renders the template when the instance exists", async () => {
      const instancePath = createTemporaryDirectory("instance");

      await mkdir(path.join(instancePath, "my-widget"), { recursive: true });
      await writeFile(
        path.join(instancePath, "my-widget", "README.md"),
        "# Drifted\n",
        "utf8",
      );

      const document = service.prepareDocument({
        instancePath,
        substitutions: SUBSTITUTIONS,
        templateDirectoryPath: template.directoryPath,
        templateFilePath: path.join(
          template.directoryPath,
          "{{nameKebabCase}}",
          "README.md",
        ),
      });

      expect(document?.renderedTemplate).toBe("# MyWidget\n");
      expect(document?.instance).toBe("# Drifted\n");
    });

    it("returns nothing when the instance file is absent", () => {
      const instancePath = createTemporaryDirectory("instance");

      expect(
        service.prepareDocument({
          instancePath,
          substitutions: SUBSTITUTIONS,
          templateDirectoryPath: template.directoryPath,
          templateFilePath: path.join(
            template.directoryPath,
            "{{nameKebabCase}}",
            "README.md",
          ),
        }),
      ).toBeUndefined();
    });
  });
});
