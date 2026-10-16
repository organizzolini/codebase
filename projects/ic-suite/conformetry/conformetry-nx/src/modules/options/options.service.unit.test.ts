import {
  ConfigurationModule,
  ConfigurationPathRequiredError,
} from "@conformetry/configuration";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import {
  DEFAULT_VALIDATE_TARGET_NAME,
  EXECUTION_OPTION_SURFACE,
  PLUGIN_OPTION_SURFACE,
} from "./options.constants";
import { OptionsService } from "./options.service";

describe(OptionsService, () => {
  let service: OptionsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigurationModule],
      providers: [OptionsService],
    }).compile();

    service = await module.resolve(OptionsService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("resolvePluginOptions", () => {
    it.each([
      ["nothing", undefined],
      ["an empty object", {}],
      ["an empty path", { configurationPath: "" }],
      ["a path of the wrong type", { configurationPath: 7 }],
    ])("refuses a missing configurationPath given %s", (_name, options) => {
      expect(() => service.resolvePluginOptions(options)).toThrow(
        ConfigurationPathRequiredError,
      );
    });

    it("names the plugin registration when refusing", () => {
      expect(() => service.resolvePluginOptions({})).toThrow(
        PLUGIN_OPTION_SURFACE,
      );
    });

    it("names the surface the caller passes when refusing", () => {
      expect(() =>
        service.resolvePluginOptions({}, EXECUTION_OPTION_SURFACE),
      ).toThrow(EXECUTION_OPTION_SURFACE);
    });

    it("defaults the target name when only the path is given", () => {
      expect(
        service.resolvePluginOptions({ configurationPath: "a/c.ts" }),
      ).toStrictEqual({
        configurationPath: "a/c.ts",
        validateTargetName: DEFAULT_VALIDATE_TARGET_NAME,
      });
    });

    it("reads the configured values", () => {
      expect(
        service.resolvePluginOptions({
          configurationPath: "conformetry.config.ts",
          validateTargetName: "conform",
        }),
      ).toStrictEqual({
        configurationPath: "conformetry.config.ts",
        validateTargetName: "conform",
      });
    });

    it("ignores values of the wrong type", () => {
      expect(
        service.resolvePluginOptions({
          configurationPath: "a/c.ts",
          validateTargetName: 42,
        }).validateTargetName,
      ).toBe(DEFAULT_VALIDATE_TARGET_NAME);
    });
  });

  describe("resolveGeneratorInputs", () => {
    it("keeps the generator's own string options", () => {
      expect(
        service.resolveGeneratorInputs({ name: "my-widget", project: "app" }),
      ).toStrictEqual({ name: "my-widget", project: "app" });
    });

    it("drops the options that configure the plugin", () => {
      expect(
        service.resolveGeneratorInputs({
          configurationPath: "conformetry.config.ts",
          name: "my-widget",
        }),
      ).toStrictEqual({ name: "my-widget" });
    });

    it("drops values that are not text", () => {
      expect(
        service.resolveGeneratorInputs({ dryRun: true, name: "my-widget" }),
      ).toStrictEqual({ name: "my-widget" });
    });

    it("returns nothing for a non-object", () => {
      expect(service.resolveGeneratorInputs("nope")).toStrictEqual({});
    });
  });

  describe("resolveConfigurationPath", () => {
    it("reads the path out of this plugin's registration", () => {
      expect(
        service.resolveConfigurationPath({
          nxConfiguration: {
            plugins: [
              {
                options: { targetName: "eslint" },
                plugin: "@nx/eslint/plugin",
              },
              {
                options: { configurationPath: "configuration/conformetry.ts" },
                plugin: "@conformetry/nx",
              },
            ],
          },
        }),
      ).toBe("configuration/conformetry.ts");
    });

    it.each([
      ["no configuration at all", undefined],
      ["a configuration that is not an object", "nx.json"],
      ["a configuration with no plugins", {}],
      ["plugins that are not a list", { plugins: "@nx/eslint/plugin" }],
      ["a list holding no entry for this plugin", { plugins: ["@nx/vite"] }],
      [
        "an entry for this plugin naming no path",
        { plugins: [{ plugin: "@conformetry/nx" }] },
      ],
      [
        "an entry for this plugin whose options are not an object",
        { plugins: [{ options: 7, plugin: "@conformetry/nx" }] },
      ],
    ])("refuses a registration given %s", (_description, nxConfiguration) => {
      expect(() =>
        service.resolveConfigurationPath({ nxConfiguration }),
      ).toThrow(ConfigurationPathRequiredError);
    });

    it("names the plugin registration unless the caller names a surface", () => {
      expect(() =>
        service.resolveConfigurationPath({ nxConfiguration: {} }),
      ).toThrow(PLUGIN_OPTION_SURFACE);
      expect(() =>
        service.resolveConfigurationPath({
          nxConfiguration: {},
          surface: EXECUTION_OPTION_SURFACE,
        }),
      ).toThrow(EXECUTION_OPTION_SURFACE);
    });

    it("prefers the configuration option over the registration", () => {
      expect(
        service.resolveConfigurationPath({
          configuration: "mine.ts",
          nxConfiguration: {
            plugins: [
              {
                options: { configurationPath: "registered.ts" },
                plugin: "@conformetry/nx",
              },
            ],
          },
        }),
      ).toBe("mine.ts");
    });
  });
});
