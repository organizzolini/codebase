import { ConfigurationService } from "@callidescope/configuration";
import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  EXECUTOR_CONFIGURATION_SURFACE,
  PLUGIN_CONFIGURATION_SURFACE,
} from "./options.constants";
import { OptionsService } from "./options.service";

describe(OptionsService, () => {
  let configurationService: ConfigurationService;
  let service: OptionsService;

  beforeAll(async () => {
    configurationService = createMock<ConfigurationService>();

    const module = await Test.createTestingModule({
      providers: [
        OptionsService,
        { provide: ConfigurationService, useValue: configurationService },
      ],
    }).compile();

    service = await module.resolve(OptionsService);
  });

  beforeEach(() => {
    vi.mocked(configurationService.requireConfigurationPath).mockImplementation(
      (path: string | undefined): string => path ?? "",
    );
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("resolvePluginOptions", () => {
    it("reads every target name and the configuration path a registration gives", () => {
      expect.hasAssertions();

      expect(
        service.resolvePluginOptions({
          breadthTargetName: "callidescope-breadth",
          configurationPath: "configuration/callidescope.config.ts",
          depthTargetName: "callidescope-depth",
          gateTargetName: "callidescope-gate",
          traceTargetName: "callidescope-trace",
        }),
      ).toStrictEqual({
        breadthTargetName: "callidescope-breadth",
        configurationPath: "configuration/callidescope.config.ts",
        depthTargetName: "callidescope-depth",
        gateTargetName: "callidescope-gate",
        traceTargetName: "callidescope-trace",
      });
    });

    it.each([
      ["only the configuration path", {}],
      ["a non-string target name", { traceTargetName: 7 }],
      ["an empty target name", { traceTargetName: "" }],
    ])(
      "falls back to the default target names given %s",
      (_description, extra) => {
        expect.hasAssertions();

        // A typo in a target name must not stop the project graph being built.
        expect(
          service.resolvePluginOptions({
            configurationPath: "callidescope.config.ts",
            ...extra,
          }),
        ).toStrictEqual({
          breadthTargetName: "breadth",
          configurationPath: "callidescope.config.ts",
          depthTargetName: "depth",
          gateTargetName: "gate",
          traceTargetName: "trace",
        });
      },
    );

    it("overrides one target name without disturbing the others", () => {
      expect.hasAssertions();

      expect(
        service.resolvePluginOptions({
          configurationPath: "callidescope.config.ts",
          depthTargetName: "callidescope-depth",
        }),
      ).toMatchObject({
        breadthTargetName: "breadth",
        depthTargetName: "callidescope-depth",
        gateTargetName: "gate",
        traceTargetName: "trace",
      });
    });
  });

  // The refusal itself lives in `@callidescope/configuration`, where its own
  // tests are; what is pinned here is only what this plugin hands it.
  describe("configurationPath", () => {
    it.each([
      ["nothing", undefined, undefined],
      ["a blank path", { configurationPath: "" }, undefined],
      ["a non-string path", { configurationPath: 7 }, undefined],
      ["a path", { configurationPath: "a.ts" }, "a.ts"],
    ])(
      "asks the configuration layer about %s",
      (_description, options, path) => {
        expect.hasAssertions();

        service.resolvePluginOptions(options);

        expect(
          configurationService.requireConfigurationPath,
        ).toHaveBeenCalledWith(path, PLUGIN_CONFIGURATION_SURFACE);
      },
    );

    it("lets the refusal of the configuration layer through", () => {
      expect.hasAssertions();

      vi.mocked(
        configurationService.requireConfigurationPath,
      ).mockImplementation(() => {
        throw new Error("refused");
      });

      expect(() => service.resolvePluginOptions({})).toThrow("refused");
    });

    it("names the plugin option and its registration in the surface", () => {
      expect.hasAssertions();
      expect(PLUGIN_CONFIGURATION_SURFACE).toBe(
        'The "configurationPath" option in the nx.json registration of @callidescope/nx',
      );
    });
  });

  describe("readConfiguration", () => {
    it.each([
      ["a string", "a.ts", "a.ts"],
      ["a non-string", 7, undefined],
      ["nothing", undefined, undefined],
    ])("asks the configuration layer about %s", (_description, value, path) => {
      expect.hasAssertions();

      service.readConfiguration(value);

      expect(
        configurationService.requireConfigurationPath,
      ).toHaveBeenCalledWith(path, EXECUTOR_CONFIGURATION_SURFACE);
    });
  });

  describe("readStringList", () => {
    it.each([
      ["an array", ["alpha", "beta"], ["alpha", "beta"]],
      ["a comma-separated entry", ["alpha,beta"], ["alpha", "beta"]],
      ["a bare string", "alpha,beta", ["alpha", "beta"]],
      [
        "blank and untrimmed entries",
        [" alpha ", "", " , beta"],
        ["alpha", "beta"],
      ],
      ["non-string entries", ["alpha", 7, null], ["alpha"]],
      ["a non-list", 7, []],
      ["nothing", undefined, []],
    ])("reads %s", (_description, value, expected) => {
      expect.hasAssertions();
      expect(service.readStringList(value)).toStrictEqual(expected);
    });
  });

  describe("readLookupOptions", () => {
    it("reads the configuration path and narrows the format together", () => {
      expect.hasAssertions();
      expect(
        service.readLookupOptions({ configuration: "a.ts", format: "json" }),
      ).toStrictEqual({ configurationPath: "a.ts", format: "json" });
      expect(
        service.readLookupOptions({ configuration: "a.ts", format: "nope" }),
      ).toStrictEqual({ configurationPath: "a.ts", format: undefined });
    });
  });

  describe("readFormat", () => {
    it.each(["json", "markdown", "mermaid"])("accepts %s", (format) => {
      expect.hasAssertions();
      expect(service.readFormat(format)).toBe(format);
    });

    it.each([
      ["an unknown format", "yaml"],
      ["a non-string", 7],
      ["nothing", undefined],
    ])("refuses %s, leaving the configured format alone", (_d, value) => {
      expect.hasAssertions();
      expect(service.readFormat(value)).toBeUndefined();
    });
  });
});
