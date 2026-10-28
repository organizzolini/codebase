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

  describe("findProjectConfigurationFile", () => {
    it("finds a configuration file colocated with the project", async () => {
      const directory = createTemporaryDirectory("codependix-loader");
      const configurationPath = path.join(directory, "codependix.config.json");

      await writeFile(configurationPath, "{}", "utf8");

      expect(service.findProjectConfigurationFile(directory)).toBe(
        configurationPath,
      );
    });

    it("never walks upward", async () => {
      const root = createTemporaryDirectory("codependix-loader");
      const nested = path.join(root, "nested");

      await mkdir(nested, { recursive: true });
      await writeFile(path.join(root, "codependix.config.json"), "{}", "utf8");

      expect(service.findProjectConfigurationFile(nested)).toBeUndefined();
    });
  });

  describe("readAuthoredConfiguration", () => {
    it("reads and parses a JSON configuration file", async () => {
      const directory = createTemporaryDirectory("codependix-loader");

      await writeFile(
        path.join(directory, "codependix.config.json"),
        JSON.stringify({ include: ["**"] }),
        "utf8",
      );

      await expect(
        service.readAuthoredConfiguration({
          configurationPath: path.join(directory, "codependix.config.json"),
        }),
      ).resolves.toStrictEqual({ include: ["**"] });
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
