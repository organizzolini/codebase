import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { PluginConfigurationPathRequiredError } from "./options.constants";
import { OptionsService } from "./options.service";

describe(OptionsService, () => {
  let service: OptionsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [OptionsService],
    }).compile();

    service = await module.resolve(OptionsService);
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

  describe("configurationPath", () => {
    it("is required, and refused by name when the registration omits it", () => {
      expect.hasAssertions();
      expect(() => service.resolvePluginOptions({})).toThrow(
        PluginConfigurationPathRequiredError,
      );
      expect(() => service.resolvePluginOptions({})).toThrow(
        /@callidescope\/nx.*"configurationPath"/,
      );
    });

    it.each([
      ["nothing", undefined],
      ["a blank path", { configurationPath: "" }],
      ["a non-string path", { configurationPath: 7 }],
    ])("refuses %s", (_description, options) => {
      expect.hasAssertions();
      expect(() => service.resolvePluginOptions(options)).toThrow(
        PluginConfigurationPathRequiredError,
      );
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
