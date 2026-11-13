import { readdirSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import {
  createFileTree,
  createTemporaryDirectory,
  writeFileTree,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderingService } from "../rendering/rendering.service";
import { TemplateDiscoveryService } from "../template-discovery/template-discovery.service";

import { InstanceDiscoveryMatchingService } from "./instance-discovery-matching.service";

import type { TemplateDefinition } from "../template-discovery/template-discovery.types";

/** Reads every template folder directly under a root. */
function collectTemplates(
  templatesService: TemplateDiscoveryService,
  templatesRootPath: string,
): TemplateDefinition[] {
  return readdirSync(templatesRootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      return templatesService.collectTemplate({
        name: entry.name,
        templatePath: path.join(templatesRootPath, entry.name),
      });
    });
}

/**
 * Creates a module directory holding the five service-module files, and
 * returns its *parent* — the instance path a template's tree is laid over.
 */
function createServiceModule(stem: string): string {
  return createFileTree(
    emptyFiles(
      [
        ".constants.ts",
        ".module.ts",
        ".service.ts",
        ".service.unit.test.ts",
        ".types.ts",
      ].map((suffix) => `${stem}/${stem}${suffix}`),
    ),
    { label: "instance" },
  );
}

/**
 * Builds a templates root mirroring this workspace's real shapes, so the
 * ranking is exercised against the cases it actually has to discriminate.
 */
function createTemplates(): {
  templates: TemplateDefinition[];
  templatesRootPath: string;
} {
  const templatesRootPath = createTemporaryDirectory("templates");
  const layout: Record<string, string[]> = {
    "nestjs-graphql-module": [
      "{{nameKebabCase}}/{{nameKebabCase}}.constants.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.entities.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.factories.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.module.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.resolver.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.resolver.unit.test.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.types.ts",
    ],
    "nestjs-service-file": [
      "{{nameKebabCase}}.service.ts",
      "{{nameKebabCase}}.service.unit.test.ts",
    ],
    "nestjs-service-module": [
      "{{nameKebabCase}}/{{nameKebabCase}}.constants.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.module.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.service.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.service.unit.test.ts",
      "{{nameKebabCase}}/{{nameKebabCase}}.types.ts",
    ],
  };

  writeFileTree(
    templatesRootPath,
    emptyFiles(
      Object.entries(layout).flatMap(([name, filenames]) =>
        filenames.map((filename) => `${name}/${filename}`),
      ),
    ),
  );

  return { templates: [], templatesRootPath };
}

/** Empty files at each relative path, in the shape `writeFileTree` takes. */
function emptyFiles(filePaths: readonly string[]): Record<string, string> {
  return Object.fromEntries(filePaths.map((filePath) => [filePath, ""]));
}

describe(InstanceDiscoveryMatchingService, () => {
  let service: InstanceDiscoveryMatchingService;
  let templatesService: TemplateDiscoveryService;

  beforeAll(async () => {
    const built = await buildTestingModule(InstanceDiscoveryMatchingService, {
      providers: [TemplateDiscoveryService, RenderingService],
    });

    service = built.instance;
    templatesService = await built.module.resolve(TemplateDiscoveryService);
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      InstanceDiscoveryMatchingService,
      { providers: [TemplateDiscoveryService, RenderingService] },
    );

    expect(instance).toBeInstanceOf(InstanceDiscoveryMatchingService);
  });

  describe("buildSubstitutions", () => {
    it("derives name variants from the instance stem", () => {
      expect(
        service.buildSubstitutions({
          nameStem: "my-widget",
          path: "/w/packages/x",
        }),
      ).toStrictEqual({
        name: "my-widget",
        nameCamelCase: "myWidget",
        nameKebabCase: "my-widget",
        namePascalCase: "MyWidget",
        nameSnakeCase: "my_widget",
      });
    });

    it("lets caller-supplied substitutions win", () => {
      expect(
        service.buildSubstitutions({
          nameStem: "my-widget",
          path: "/w/packages/x",
          substitutions: { name: "overridden", type: "packages" },
        }),
      ).toMatchObject({ name: "overridden", type: "packages" });
    });
  });

  describe("matchInstances", () => {
    it("stands in for every placeholder but name and supplied ones", () => {
      const templatesRootPath = createTemporaryDirectory("templates");

      writeFileTree(templatesRootPath, {
        "route/{{nameKebabCase}}.ts":
          '"{{name}}" "{{path}}" "{{title}}" "{{type}}"',
      });
      const instancePath = createFileTree(
        { "word.ts": "" },
        { label: "conformetry" },
      );
      const { matched } = service.matchInstances({
        instances: [
          {
            nameStem: "word",
            path: instancePath,
            substitutions: { title: "Word", type: "applications" },
          },
        ],
        templates: collectTemplates(templatesService, templatesRootPath),
      });

      expect(Object.keys(matched[0]?.placeholderValues ?? {})).toStrictEqual([
        "path",
      ]);
      expect(matched[0]?.substitutions).toMatchObject({
        name: "word",
        title: "Word",
        type: "applications",
      });
    });

    it("prefers the larger template when both match completely", () => {
      const { templatesRootPath } = createTemplates();
      const templates = collectTemplates(templatesService, templatesRootPath);
      const instancePath = createServiceModule("differences");

      const { matched } = service.matchInstances({
        instances: [{ nameStem: "differences", path: instancePath }],
        templates,
      });

      expect(matched[0]?.template.name).toBe("nestjs-service-module");
      expect(matched[0]?.matchedFileCount).toBe(5);
    });

    it("rejects a partially matching larger template on ratio", () => {
      const { templatesRootPath } = createTemplates();
      const templates = collectTemplates(templatesService, templatesRootPath);
      const instancePath = createServiceModule("differences");

      const { matched } = service.matchInstances({
        instances: [{ nameStem: "differences", path: instancePath }],
        templates,
      });

      // graphql-module shares constants/module/types (3 of 7 = 43%) and must lose
      expect(matched[0]?.template.name).not.toBe("nestjs-graphql-module");
    });

    it("selects a two-file template when a file scope narrows the instance", () => {
      const { templatesRootPath } = createTemplates();
      const templates = collectTemplates(templatesService, templatesRootPath);
      const instancePath = createServiceModule("differences");

      const modulePath = path.join(instancePath, "differences");
      const { matched } = service.matchInstances({
        instances: [
          {
            fileScope: [
              path.join(modulePath, "differences.service.ts"),
              path.join(modulePath, "differences.service.unit.test.ts"),
            ],
            nameStem: "differences",
            path: modulePath,
          },
        ],
        templates,
      });

      expect(matched[0]?.template.name).toBe("nestjs-service-file");
    });

    it("reports an instance no template explains", () => {
      const { templatesRootPath } = createTemplates();
      const templates = collectTemplates(templatesService, templatesRootPath);
      const instancePath = createTemporaryDirectory("empty");

      const { matched, unmatched } = service.matchInstances({
        instances: [{ nameStem: "nothing", path: instancePath }],
        templates,
      });

      expect(matched).toStrictEqual([]);
      expect(unmatched[0]?.reason).toBe("no-match");
    });

    it("reports two partially matching templates that tie as ambiguous", () => {
      const templatesRootPath = createTemporaryDirectory("templates");
      const layout: Record<string, string[]> = {
        // Each shares exactly one file with the instance, so both reach 50%.
        alpha: [
          "{{nameKebabCase}}/{{nameKebabCase}}.service.ts",
          "{{nameKebabCase}}/{{nameKebabCase}}.resolver.ts",
        ],
        beta: [
          "{{nameKebabCase}}/{{nameKebabCase}}.module.ts",
          "{{nameKebabCase}}/{{nameKebabCase}}.dataloader.ts",
        ],
      };

      writeFileTree(
        templatesRootPath,
        emptyFiles(
          Object.entries(layout).flatMap(([name, filenames]) =>
            filenames.map((filename) => `${name}/${filename}`),
          ),
        ),
      );

      const instancePath = createServiceModule("differences");
      const { unmatched } = service.matchInstances({
        instances: [{ nameStem: "differences", path: instancePath }],
        templates: collectTemplates(templatesService, templatesRootPath),
      });

      expect(unmatched[0]?.reason).toBe("ambiguous");
      expect(unmatched[0]?.tiedTemplateNames).toStrictEqual(["alpha", "beta"]);
    });

    it("breaks an equal-ratio tie by absolute matched file count", () => {
      const templatesRootPath = createTemporaryDirectory("templates");
      const layout: Record<string, string[]> = {
        // Both templates reach a 50% match ratio, so the tiebreaker must fall
        // to whichever matched more files in absolute terms — "larger".
        larger: [
          "larger.service.ts",
          "larger.module.ts",
          "larger.types.ts",
          "larger.constants.ts",
        ],
        smaller: ["smaller.service.ts", "smaller.module.ts"],
      };

      writeFileTree(
        templatesRootPath,
        emptyFiles(
          Object.entries(layout).flatMap(([name, filenames]) =>
            filenames.map((filename) => `${name}/${filename}`),
          ),
        ),
      );

      // Matches half of "larger" (2 of 4) and half of "smaller" (1 of 2).
      const instancePath = createFileTree(
        emptyFiles([
          "larger.service.ts",
          "larger.module.ts",
          "smaller.service.ts",
        ]),
        { label: "instance" },
      );

      const matches = service.matchTemplates({
        instance: { nameStem: "differences", path: instancePath },
        substitutions: {},
        templates: collectTemplates(templatesService, templatesRootPath),
      });

      expect(matches.map((match) => match.template.name)).toStrictEqual([
        "larger",
        "smaller",
      ]);
    });

    it("matches every template an instance satisfies completely", () => {
      const templatesRootPath = createTemporaryDirectory("templates");
      const layout: Record<string, string> = {
        alpha: "{{nameKebabCase}}/{{nameKebabCase}}.service.ts",
        beta: "{{nameKebabCase}}/{{nameKebabCase}}.module.ts",
      };

      writeFileTree(
        templatesRootPath,
        emptyFiles(
          Object.entries(layout).map(
            ([name, filename]) => `${name}/${filename}`,
          ),
        ),
      );

      const instancePath = createServiceModule("differences");
      const { matched, unmatched } = service.matchInstances({
        instances: [{ nameStem: "differences", path: instancePath }],
        templates: collectTemplates(templatesService, templatesRootPath),
      });

      expect(matched.map((instance) => instance.template.name)).toStrictEqual([
        "alpha",
        "beta",
      ]);
      expect(unmatched).toStrictEqual([]);
    });
  });
});
