import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { ConfigurationModule } from "@conformetry/configuration";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { GenerationService } from "./generation.service";

import type { FormatterAdapter } from "./generation.types";
import type {
  DirectoryEntry,
  FileSystemAdapter,
  GeneratorDefinition,
  GeneratorHookContext,
} from "@conformetry/core";

class MockFileSystemAdapter implements FileSystemAdapter {
  private readonly directoryEntries = new Map<string, DirectoryEntry[]>();
  private readonly files = new Map<string, string>();

  public async listDirectory(instancePath: string): Promise<DirectoryEntry[]> {
    await Promise.resolve();
    const entries = this.directoryEntries.get(instancePath);
    if (entries === undefined) {
      throw new Error(`Directory ${instancePath} does not exist`);
    }

    return entries;
  }

  public async makeDirectory(instancePath: string): Promise<void> {
    await Promise.resolve();
    if (!this.directoryEntries.has(instancePath)) {
      this.directoryEntries.set(instancePath, []);
    }
  }

  public async readFile(filePath: string): Promise<string> {
    await Promise.resolve();
    const content = this.files.get(filePath);
    if (content === undefined) {
      throw new Error(`File ${filePath} does not exist`);
    }

    return content;
  }

  public seedDirectory(instancePath: string, entries: DirectoryEntry[]): void {
    this.directoryEntries.set(instancePath, entries);
  }

  public seedFile(filePath: string, content: string): void {
    this.files.set(filePath, content);
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    await Promise.resolve();
    this.files.set(filePath, content);
  }
}

class MockFormatterAdapter implements FormatterAdapter {
  public readonly formattedFiles: string[] = [];

  public async formatFiles(filePaths: string[]): Promise<void> {
    await Promise.resolve();
    this.formattedFiles.push(...filePaths);
  }
}

describe(GenerationService, () => {
  let service: GenerationService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigurationModule],
      providers: [GenerationService],
    }).compile();

    service = await module.resolve(GenerationService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("renders templates, runs hooks, and formats generated files", async () => {
    const filesystem = new MockFileSystemAdapter();
    const formatter = new MockFormatterAdapter();
    let preGenerateContext: GeneratorHookContext | undefined;
    let postGenerateContext: GeneratorHookContext | undefined;
    const preGenerate = vi.fn<(context: GeneratorHookContext) => void>(
      (context) => {
        preGenerateContext = {
          ...context,
          generatedFilePaths: [...context.generatedFilePaths],
          input: { ...context.input },
          substitutions: { ...context.substitutions },
        };
      },
    );
    const postGenerate = vi.fn<(context: GeneratorHookContext) => void>(
      (context) => {
        postGenerateContext = {
          ...context,
          generatedFilePaths: [...context.generatedFilePaths],
          input: { ...context.input },
          substitutions: { ...context.substitutions },
        };
      },
    );

    filesystem.seedDirectory("/templates", [
      { isDirectory: true, name: "{{nameKebabCase}}" },
      { isDirectory: false, name: "README.md" },
    ]);
    filesystem.seedDirectory("/templates/{{nameKebabCase}}", [
      { isDirectory: false, name: "index.ts" },
    ]);
    filesystem.seedFile("/templates/README.md", "# {{namePascalCase}}\n");
    filesystem.seedFile(
      "/templates/{{nameKebabCase}}/index.ts",
      "export const name = '{{nameKebabCase}}';\n",
    );

    const definition: GeneratorDefinition = {
      hooks: { postGenerate, preGenerate },
      name: "alpha-module",
      templateDirectoryPath: "/templates",
    };

    const result = await service.runGenerator({
      configurationDirectoryPath: "/workspace/configuration",
      definition,
      filesystem,
      formatter,
      inputs: { name: "alpha-module" },
      instancePath: "/output",
    });

    expect(preGenerate).toHaveBeenCalledTimes(1);
    expect(postGenerate).toHaveBeenCalledTimes(1);
    expect(preGenerateContext?.generatedFilePaths).toStrictEqual([]);
    expect(preGenerateContext?.substitutions).toStrictEqual({
      name: "alpha-module",
      nameCamelCase: "alphaModule",
      nameKebabCase: "alpha-module",
      namePascalCase: "AlphaModule",
      nameSnakeCase: "alpha_module",
    });
    expect(postGenerateContext?.generatedFilePaths).toStrictEqual([
      "/output/README.md",
      "/output/alpha-module/index.ts",
    ]);
    expect(result.generatedFilePaths).toStrictEqual([
      "/output/README.md",
      "/output/alpha-module/index.ts",
    ]);
    expect(formatter.formattedFiles).toStrictEqual([
      "/output/README.md",
      "/output/alpha-module/index.ts",
    ]);
  });

  it("excludes unset inputs so they cannot shadow derived substitutions", async () => {
    const filesystem = new MockFileSystemAdapter();
    let hookContext: GeneratorHookContext | undefined;

    filesystem.seedDirectory("/templates", []);

    await service.runGenerator({
      configurationDirectoryPath: "/workspace/configuration",
      definition: {
        hooks: {
          preGenerate: (context) => {
            hookContext = { ...context, input: { ...context.input } };
          },
        },
        name: "alpha-module",
        templateDirectoryPath: "/templates",
      },
      filesystem,
      inputs: { alpha: "one", beta: undefined, gamma: "three" },
      instancePath: "/output",
    });

    expect(hookContext?.input).toStrictEqual({ alpha: "one", gamma: "three" });
  });

  it("lets an explicit input win over the derived name substitution", async () => {
    const filesystem = new MockFileSystemAdapter();
    let hookContext: GeneratorHookContext | undefined;

    filesystem.seedDirectory("/templates", []);

    await service.runGenerator({
      configurationDirectoryPath: "/workspace/configuration",
      definition: {
        hooks: {
          preGenerate: (context) => {
            hookContext = {
              ...context,
              substitutions: { ...context.substitutions },
            };
          },
        },
        name: "alpha-module",
        templateDirectoryPath: "/templates",
      },
      filesystem,
      inputs: { name: "alpha-module", namePascalCase: "OverriddenName" },
      instancePath: "/output",
    });

    expect(hookContext?.substitutions["namePascalCase"]).toBe("OverriddenName");
  });

  it("falls back to the definition name and default adapters", async () => {
    const templateDirectoryPath = await mkdtemp(
      path.join(tmpdir(), "conformetry-generation-default-runtime-"),
    );

    const result = await service.runGenerator({
      configurationDirectoryPath: "/workspace/configuration",
      definition: { name: "fallback-name", templateDirectoryPath },
      instancePath: "/output",
    });

    expect(result).toStrictEqual({
      generatedFilePaths: [],
      outputDirectoryPath: "/output",
    });
  });

  it("renders nested templates through the default filesystem", async () => {
    const templateDirectoryPath = await mkdtemp(
      path.join(tmpdir(), "conformetry-generation-template-runtime-"),
    );
    const instancePath = await mkdtemp(
      path.join(tmpdir(), "conformetry-generation-output-runtime-"),
    );
    const nestedTemplateDirectoryPath = path.join(
      templateDirectoryPath,
      "{{nameKebabCase}}",
    );

    await mkdir(nestedTemplateDirectoryPath, { recursive: true });
    await writeFile(
      path.join(templateDirectoryPath, "README.md"),
      "# {{namePascalCase}}\n",
      "utf8",
    );
    await writeFile(
      path.join(nestedTemplateDirectoryPath, "{{nameSnakeCase}}.txt"),
      "{{nameKebabCase}}",
      "utf8",
    );

    const result = await service.runGenerator({
      configurationDirectoryPath: "/workspace/configuration",
      definition: { name: "fallback-name", templateDirectoryPath },
      inputs: { name: "nested-template" },
      instancePath,
    });

    const renderedReadmePath = path.join(instancePath, "README.md");
    const renderedNestedPath = path.join(
      instancePath,
      "nested-template",
      "nested_template.txt",
    );

    expect(result.generatedFilePaths).toStrictEqual(
      [renderedReadmePath, renderedNestedPath].toSorted(),
    );
    await expect(readFile(renderedReadmePath, "utf8")).resolves.toBe(
      "# NestedTemplate\n",
    );
    await expect(readFile(renderedNestedPath, "utf8")).resolves.toBe(
      "nested-template",
    );
  });

  describe("the hook context", () => {
    const CONFIGURATION_DIRECTORY_PATH = "/workspace/configuration";

    it("hands both hooks the adapter in use and the configuration directory", async () => {
      const filesystem = new MockFileSystemAdapter();
      const received: Record<string, GeneratorHookContext> = {};

      filesystem.seedDirectory("/templates", []);

      await service.runGenerator({
        configurationDirectoryPath: CONFIGURATION_DIRECTORY_PATH,
        definition: {
          hooks: {
            postGenerate: (context) => {
              received["postGenerate"] = context;
            },
            preGenerate: (context) => {
              received["preGenerate"] = context;
            },
          },
          name: "alpha-module",
          templateDirectoryPath: "/templates",
        },
        filesystem,
        inputs: { name: "alpha-module" },
        instancePath: "/output",
      });

      for (const hookName of ["preGenerate", "postGenerate"]) {
        expect(received[hookName]?.filesystem).toBe(filesystem);
        expect(received[hookName]?.configurationDirectoryPath).toBe(
          CONFIGURATION_DIRECTORY_PATH,
        );
      }
    });

    it("hands the hooks the disk adapter when the host supplied none", async () => {
      const templateDirectoryPath = await mkdtemp(
        path.join(tmpdir(), "conformetry-generation-hook-default-"),
      );
      let hookContext: GeneratorHookContext | undefined;

      await service.runGenerator({
        configurationDirectoryPath: CONFIGURATION_DIRECTORY_PATH,
        definition: {
          hooks: {
            preGenerate: (context) => {
              hookContext = context;
            },
          },
          name: "alpha-module",
          templateDirectoryPath,
        },
        instancePath: "/output",
      });

      try {
        await expect(
          hookContext?.filesystem.listDirectory(templateDirectoryPath),
        ).resolves.toStrictEqual([]);
      } finally {
        await rm(templateDirectoryPath, { force: true, recursive: true });
      }
    });

    it("writes nothing and formats nothing when preGenerate throws", async () => {
      const filesystem = new MockFileSystemAdapter();
      const formatter = new MockFormatterAdapter();
      const writeFileSpy = vi.spyOn(filesystem, "writeFile");

      filesystem.seedDirectory("/templates", [
        { isDirectory: false, name: "README.md" },
      ]);
      filesystem.seedFile("/templates/README.md", "# {{namePascalCase}}\n");

      await expect(
        service.runGenerator({
          configurationDirectoryPath: CONFIGURATION_DIRECTORY_PATH,
          definition: {
            hooks: {
              preGenerate: () => {
                throw new Error("refused before rendering");
              },
            },
            name: "alpha-module",
            templateDirectoryPath: "/templates",
          },
          filesystem,
          formatter,
          inputs: { name: "alpha-module" },
          instancePath: "/output",
        }),
      ).rejects.toThrow("refused before rendering");

      expect(writeFileSpy).not.toHaveBeenCalled();
      expect(formatter.formattedFiles).toStrictEqual([]);
    });

    it("aborts before formatting when postGenerate throws", async () => {
      const filesystem = new MockFileSystemAdapter();
      const formatter = new MockFormatterAdapter();

      filesystem.seedDirectory("/templates", []);

      await expect(
        service.runGenerator({
          configurationDirectoryPath: CONFIGURATION_DIRECTORY_PATH,
          definition: {
            hooks: {
              postGenerate: () => {
                throw new Error("refused after rendering");
              },
            },
            name: "alpha-module",
            templateDirectoryPath: "/templates",
          },
          filesystem,
          formatter,
          inputs: { name: "alpha-module" },
          instancePath: "/output",
        }),
      ).rejects.toThrow("refused after rendering");

      expect(formatter.formattedFiles).toStrictEqual([]);
    });

    it("formats a file a hook added to the generated list", async () => {
      const filesystem = new MockFileSystemAdapter();
      const formatter = new MockFormatterAdapter();

      filesystem.seedDirectory("/templates", [
        { isDirectory: false, name: "README.md" },
      ]);
      filesystem.seedFile("/templates/README.md", "# {{namePascalCase}}\n");

      const result = await service.runGenerator({
        configurationDirectoryPath: CONFIGURATION_DIRECTORY_PATH,
        definition: {
          hooks: {
            postGenerate: async (context) => {
              const hookWrittenPath = path.join(
                context.configurationDirectoryPath,
                "receipt.log",
              );

              await context.filesystem.writeFile(hookWrittenPath, "receipt\n");
              context.generatedFilePaths.push(hookWrittenPath);
            },
          },
          name: "alpha-module",
          templateDirectoryPath: "/templates",
        },
        filesystem,
        formatter,
        inputs: { name: "alpha-module" },
        instancePath: "/output",
      });

      expect(formatter.formattedFiles).toStrictEqual([
        "/output/README.md",
        "/workspace/configuration/receipt.log",
      ]);
      expect(result.generatedFilePaths).toStrictEqual(formatter.formattedFiles);
      await expect(
        filesystem.readFile("/workspace/configuration/receipt.log"),
      ).resolves.toBe("receipt\n");
    });
  });
});
