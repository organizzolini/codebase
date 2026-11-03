import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ConfigurationFileNotFoundError,
  InvalidConfigurationError,
} from "@coinagerie/core";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_INCLUDE } from "./configuration.constants";
import { ConfigurationService } from "./configuration.service";

/**
 * Configuration files are written inside this project's gitignored `tmp/`,
 * because jiti resolves a configuration's imports from where the file sits.
 */
const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../../../tmp");

describe(ConfigurationService, () => {
  let service: ConfigurationService;
  let directory: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ConfigurationService],
    }).compile();

    service = await module.resolve(ConfigurationService);
  });

  beforeEach(() => {
    mkdirSync(TEMPORARY_ROOT, { recursive: true });
    directory = mkdtempSync(path.join(TEMPORARY_ROOT, "configuration-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  function writeConfiguration(relativePath: string, source: string): string {
    const filePath = path.join(directory, relativePath);
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, source);
    return filePath;
  }

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("falls back to every default when no configuration file exists", async () => {
    const configuration = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(configuration).toStrictEqual({
      configurationPath: undefined,
      directory,
      exclude: { paths: [] },
      include: [...DEFAULT_INCLUDE],
      outputs: [],
    });
  });

  it("finds a coinagerie.config.ts in the working directory", async () => {
    const configurationPath = writeConfiguration(
      "coinagerie.config.ts",
      'export default { include: ["src/**"] };\n',
    );

    const configuration = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(configuration.configurationPath).toBe(configurationPath);
    expect(configuration.include).toStrictEqual(["src/**"]);
  });

  it("reads a named file relative to the working directory and roots the run at its folder", async () => {
    const configurationPath = writeConfiguration(
      "nested/coinagerie.config.ts",
      [
        "export default {",
        '  exclude: { paths: ["**/*.test.ts"] },',
        '  outputs: [{ description: "Words.", path: "README.md", type: "markdown" }],',
        "};",
        "",
      ].join("\n"),
    );

    const configuration = await service.loadConfiguration({
      configurationPath: "nested/coinagerie.config.ts",
      workingDirectory: directory,
    });

    expect(configuration).toStrictEqual({
      configurationPath,
      directory: path.join(directory, "nested"),
      exclude: { paths: ["**/*.test.ts"] },
      include: [...DEFAULT_INCLUDE],
      outputs: [
        {
          description: "Words.",
          path: path.join(directory, "nested/README.md"),
          type: "markdown",
        },
      ],
    });
  });

  it("leaves a markdown output's description undefined when none is written", async () => {
    writeConfiguration(
      "coinagerie.config.ts",
      'export default { outputs: [{ path: "GLOSSARY.md", type: "markdown" }] };\n',
    );

    const configuration = await service.loadConfiguration({
      workingDirectory: directory,
    });

    expect(configuration.outputs).toStrictEqual([
      {
        description: undefined,
        path: path.join(directory, "GLOSSARY.md"),
        type: "markdown",
      },
    ]);
  });

  it("refuses a named file that does not exist", async () => {
    await expect(
      service.loadConfiguration({
        configurationPath: "missing.config.ts",
        workingDirectory: directory,
      }),
    ).rejects.toThrow(ConfigurationFileNotFoundError);
  });

  it.each([
    ["a field of the wrong type", 'export default { include: "src" };\n'],
    ["an unknown field", "export default { inputs: [] };\n"],
    ["an unknown exclusion", "export default { exclude: { files: [] } };\n"],
    [
      "an output of an unknown type",
      'export default { outputs: [{ path: "a.txt", type: "text" }] };\n',
    ],
    [
      "a markdown output with no path",
      'export default { outputs: [{ type: "markdown" }] };\n',
    ],
    [
      "a description holding a list item",
      'export default { outputs: [{ description: "Intro.\\n- item", path: "a.md", type: "markdown" }] };\n',
    ],
    ["a default export that is not an object", "export default 42;\n"],
    ["a file that throws while loading", 'throw new Error("broken");\n'],
    ["a file that throws something other than an error", 'throw "broken";\n'],
  ])("refuses %s, naming the file", async (_case, source) => {
    const configurationPath = writeConfiguration(
      "coinagerie.config.ts",
      source,
    );

    const loading = service.loadConfiguration({ workingDirectory: directory });

    await expect(loading).rejects.toThrow(InvalidConfigurationError);
    await expect(loading).rejects.toThrow(configurationPath);
  });
});
