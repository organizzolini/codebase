import { writeFile } from "node:fs/promises";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import {
  createTemporaryDirectory,
  useTemporaryDirectory,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { GeneratorModule } from "./generator.module";
import { GeneratorService } from "./generator.service";

import type { EmittedFile } from "./generator.types";

/** Writes a config declaring one generator with one input. */
async function createConfigurationPath(workspaceRoot: string): Promise<string> {
  const configurationPath = path.join(workspaceRoot, "conformetry.config.json");

  await writeFile(
    configurationPath,
    JSON.stringify([
      // Declared out of order so the emitted manifest proves it sorts, and
      // without a description, which is optional.
      {
        inputs: { name: { type: "string" } },
        name: "react-component",
        templatePath: "templates/react-component",
      },
      {
        description: "Generate a NestJS service module",
        inputs: { name: { type: "string" } },
        name: "nestjs-service-module",
        templatePath: "templates/nestjs-service-module",
      },
    ]),
    "utf8",
  );

  return configurationPath;
}

/** Returns the emitted file whose path ends with `suffix`. */
function findFile(files: EmittedFile[], suffix: string): EmittedFile {
  const file = files.find((emitted) => emitted.filePath.endsWith(suffix));

  if (file === undefined) {
    throw new Error(`No emitted file ending in ${suffix}.`);
  }

  return file;
}

/** Parses an emitted JSON file without widening it to `any`. */
function parseEmittedJson(
  files: EmittedFile[],
  suffix: string,
): {
  $schema?: unknown;
  generators?: unknown;
} {
  const parsed: unknown = JSON.parse(findFile(files, suffix).content);

  return typeof parsed === "object" && parsed !== null ? parsed : {};
}

describe(GeneratorService, () => {
  const readWorkspaceRoot = useTemporaryDirectory("nx-generator");
  let files: EmittedFile[];
  let service: GeneratorService;

  beforeAll(async () => {
    const built = await buildTestingModule(GeneratorService, {
      imports: [GeneratorModule],
    });

    service = built.instance;
    files = await service.emitPlugin({
      configurationPath: await createConfigurationPath(readWorkspaceRoot()),
      outputPath: "tools/generators",
      packageName: "@scope/generators",
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(GeneratorService, {
      imports: [GeneratorModule],
    });

    expect(instance).toBeInstanceOf(GeneratorService);
  });

  describe("emitPlugin", () => {
    it("emits a manifest, a module and schema each, and a package", () => {
      // Files come out sorted by generator name, not in the order the
      // configuration happens to declare them.
      expect(files.map((file) => file.filePath)).toStrictEqual([
        "tools/generators/generators.json",
        "tools/generators/src/generators/nestjs-service-module.ts",
        "tools/generators/src/generators/react-component.ts",
        "tools/generators/src/schemas/nestjs-service-module.json",
        "tools/generators/src/schemas/react-component.json",
        "tools/generators/package.json",
      ]);
    });

    it("points every generator schema inside the emitted package", () => {
      const generators = JSON.stringify(
        parseEmittedJson(files, "generators.json").generators,
      );

      expect(generators).toContain("./src/schemas/nestjs-service-module.json");
      // A schema path escaping the package resolves to nothing once installed.
      expect(generators).not.toContain("..");
    });

    it("resolves the manifest schema relative to the output path", () => {
      expect(parseEmittedJson(files, "generators.json").$schema).toBe(
        "../../node_modules/@nx/devkit/src/generators/generators-schema.json",
      );
    });

    it("points each factory at the module named after its generator", () => {
      expect(findFile(files, "generators.json").content).toContain(
        "./src/generators/nestjs-service-module#generate",
      );
    });

    it("gives every generator module the same single export", () => {
      const module = findFile(
        files,
        "src/generators/nestjs-service-module.ts",
      ).content;

      expect(module).toContain("export async function generate(");
      // The generator's own name is bound here because Nx never passes it.
      expect(module).toContain('generatorName: "nestjs-service-module"');
      expect(module.match(/export /g)).toHaveLength(1);
    });

    it("requires every configured parameter", () => {
      const schema: unknown = JSON.parse(
        findFile(files, "schemas/nestjs-service-module.json").content,
      );

      expect(schema).toMatchObject({
        properties: { name: { type: "string" } },
        required: ["name"],
      });
    });

    it("declares the plugin the wrappers import", () => {
      const manifest: unknown = JSON.parse(
        findFile(files, "tools/generators/package.json").content,
      );

      expect(manifest).toMatchObject({
        dependencies: { "@conformetry/nx": "workspace:*" },
        name: "@scope/generators",
      });
    });

    it("offers only the projects a tagged group selects", async () => {
      const scopedPath = path.join(
        path.dirname(
          await createConfigurationPath(
            createTemporaryDirectory("nx-generator"),
          ),
        ),
        "scoped.config.json",
      );

      await writeFile(
        scopedPath,
        JSON.stringify([
          {
            inputs: { project: { type: "string" } },
            instances: [
              { patterns: ["src/modules/*"], tags: ["framework:nestjs"] },
            ],
            name: "nestjs-service-module",
            templatePath: "templates/module",
          },
        ]),
        "utf8",
      );

      const scopedFiles = await service.emitPlugin({
        configurationPath: scopedPath,
        outputPath: "tools/generators",
        packageName: "@scope/generators",
        projects: [
          {
            name: "widgets",
            root: "packages/widgets",
            tags: ["framework:nestjs"],
          },
          {
            name: "storefront",
            root: "applications/storefront",
            tags: ["framework:react"],
          },
        ],
      });
      const schema: unknown = JSON.parse(
        findFile(scopedFiles, "schemas/nestjs-service-module.json").content,
      );

      // Nx builds its prompt from the schema, so constraining one constrains
      // the other.
      expect(schema).toMatchObject({
        properties: { project: { enum: ["widgets"] } },
      });
    });

    it("leaves the project input alone when no group is tagged", () => {
      // The fixture's generators declare no instances at all, so nothing
      // should constrain what `nx g` offers.
      expect(
        findFile(files, "schemas/nestjs-service-module.json").content,
      ).not.toContain('"enum"');
    });

    it("emits the same bytes for the same configuration", async () => {
      const configurationPath = await createConfigurationPath(
        createTemporaryDirectory("nx-generator"),
      );

      await expect(
        service.emitPlugin({
          configurationPath,
          outputPath: "tools/generators",
          packageName: "@scope/generators",
        }),
      ).resolves.toStrictEqual(
        await service.emitPlugin({
          configurationPath,
          outputPath: "tools/generators",
          packageName: "@scope/generators",
        }),
      );
    });
  });
});
