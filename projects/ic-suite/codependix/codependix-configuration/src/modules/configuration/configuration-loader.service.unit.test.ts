import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { ConfigurationLoaderService } from "./configuration-loader.service";

describe(ConfigurationLoaderService, () => {
  let service: ConfigurationLoaderService;

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(
      ConfigurationLoaderService,
    ));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ConfigurationLoaderService);

    expect(instance).toBeInstanceOf(ConfigurationLoaderService);
  });

  describe("resolveProjectConfigurationFile", () => {
    it("resolves the configured path against the project root", async () => {
      const directory = createTemporaryDirectory("codependix-loader");
      const configurationPath = path.join(
        directory,
        "configuration",
        "codependix.config.json",
      );

      await mkdir(path.dirname(configurationPath), { recursive: true });
      await writeFile(configurationPath, "{}", "utf8");

      expect(
        service.resolveProjectConfigurationFile({
          projectConfigurationPath: "configuration/codependix.config.json",
          projectRoot: directory,
        }),
      ).toBe(configurationPath);
    });

    it("returns undefined when nothing exists at the configured path, whatever sits beside it", async () => {
      const directory = createTemporaryDirectory("codependix-loader");

      await writeFile(
        path.join(directory, "codependix.config.json"),
        "{}",
        "utf8",
      );

      expect(
        service.resolveProjectConfigurationFile({
          projectConfigurationPath: "configuration/codependix.config.json",
          projectRoot: directory,
        }),
      ).toBeUndefined();
    });
  });

  describe("readAuthoredConfiguration", () => {
    it("reads and parses a JSON configuration file", async () => {
      const directory = createTemporaryDirectory("codependix-loader");

      await writeFile(
        path.join(directory, "codependix.config.json"),
        JSON.stringify({
          include: ["**"],
          projectConfigurationPath: "codependix.config.ts",
        }),
        "utf8",
      );

      await expect(
        service.readAuthoredConfiguration({
          configurationPath: path.join(directory, "codependix.config.json"),
        }),
      ).resolves.toStrictEqual({
        include: ["**"],
        projectConfigurationPath: "codependix.config.ts",
      });
    });

    it("refuses a path naming no file rather than resolving to nothing", async () => {
      const directory = createTemporaryDirectory("codependix-loader");

      await expect(
        service.readAuthoredConfiguration({
          configurationPath: path.join(directory, "codependix.config.json"),
        }),
      ).rejects.toThrow("Configuration file not found");
    });

    it("never searches the directory for a file the path did not name", async () => {
      const directory = createTemporaryDirectory("codependix-loader");

      await writeFile(path.join(directory, "codependix.config.ts"), "", "utf8");

      await expect(
        service.readAuthoredConfiguration({
          configurationPath: path.join(directory, "other.config.json"),
        }),
      ).rejects.toThrow("Configuration file not found");
    });
  });

  describe("resolveConfigurationPath", () => {
    it("resolves an existing relative path against the cwd", async () => {
      const directory = createTemporaryDirectory("codependix-loader");
      const configurationPath = path.join(directory, "codependix.config.json");

      await writeFile(configurationPath, "{}", "utf8");

      expect(service.resolveConfigurationPath(configurationPath)).toBe(
        configurationPath,
      );
    });
  });
});
