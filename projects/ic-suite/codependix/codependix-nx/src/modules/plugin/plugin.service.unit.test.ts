import { ConfigurationModule } from "@codependix/configuration";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { PluginService } from "./plugin.service";

describe(PluginService, () => {
  let service: PluginService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigurationModule],
      providers: [PluginService],
    }).compile();

    service = await module.resolve(PluginService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("inferTargets", () => {
    it("infers a cached gate delegating to this plugin's executor", () => {
      expect.hasAssertions();

      const targets = service.inferTargets({
        options: { configurationPath: "configuration/codependix.config.ts" },
        projectConfigurationFiles: ["packages/alpha/project.json"],
        toolInputs: ["{workspaceRoot}/tool/src/**/*"],
        workspaceRoot: "/workspace",
      });

      // Pinned exactly: the inputs are what make `nx affected` and the cache
      // correct — the command line's own sources last, since no judged project
      // depends on them — and `configurations` is absent so an aggregator's
      // own configuration falls through to the defaults.
      expect(targets).toStrictEqual(
        new Map([
          [
            "packages/alpha",
            {
              "codependix-gate": {
                cache: true,
                executor: "@codependix/nx:gate",
                inputs: [
                  "default",
                  "^default",
                  "{workspaceRoot}/configuration/codependix.config.ts",
                  "{projectRoot}/codependix.config.*",
                  "{workspaceRoot}/tool/src/**/*",
                ],
                options: {},
              },
            },
          ],
        ]),
      );
    });

    it("skips the workspace root, whose closure is the whole workspace", () => {
      expect.hasAssertions();

      const targets = service.inferTargets({
        options: { configurationPath: "codependix.config.ts" },
        projectConfigurationFiles: [
          "project.json",
          "packages/alpha/project.json",
        ],
        toolInputs: ["{workspaceRoot}/tool/src/**/*"],
        workspaceRoot: "/workspace",
      });

      expect([...targets.keys()]).toStrictEqual(["packages/alpha"]);
    });

    it("infers nothing from a matched codependix configuration file", () => {
      expect.hasAssertions();

      // The glob matches it only so that editing it re-runs inference.
      expect(
        service.inferTargets({
          options: { configurationPath: "codependix.config.ts" },
          projectConfigurationFiles: ["packages/alpha/codependix.config.ts"],
          toolInputs: ["{workspaceRoot}/tool/src/**/*"],
          workspaceRoot: "/workspace",
        }).size,
      ).toBe(0);
    });

    it("names the gate and its configuration input after the registration", () => {
      expect.hasAssertions();

      const targets = service.inferTargets({
        options: {
          configurationPath: "codependix.config.ts",
          gateTargetName: "boundaries",
        },
        projectConfigurationFiles: ["packages/alpha/project.json"],
        toolInputs: ["{workspaceRoot}/tool/src/**/*"],
        workspaceRoot: "/workspace",
      });

      expect(Object.keys(targets.get("packages/alpha") ?? {})).toStrictEqual([
        "boundaries",
      ]);
      expect(targets.get("packages/alpha")?.["boundaries"]?.inputs).toContain(
        "{workspaceRoot}/codependix.config.ts",
      );
    });

    it("refuses to infer a gate for a registration naming no configuration path", () => {
      expect.hasAssertions();

      expect(() =>
        service.inferTargets({
          options: {},
          projectConfigurationFiles: ["packages/alpha/project.json"],
          toolInputs: ["{workspaceRoot}/tool/src/**/*"],
          workspaceRoot: "/workspace",
        }),
      ).toThrow(/`configurationPath` option on the @codependix\/nx plugin/);
    });
  });

  describe("resolvePluginOptions", () => {
    it("reads the target name and configuration path a registration gives", () => {
      expect.hasAssertions();

      expect(
        service.resolvePluginOptions({
          options: {
            configurationPath: "configuration/codependix.config.ts",
            gateTargetName: "boundaries",
          },
        }),
      ).toStrictEqual({
        configurationPath: "configuration/codependix.config.ts",
        gateTargetName: "boundaries",
      });
    });

    it.each([
      ["nothing registered", undefined],
      ["a null registration", null],
      ["a string registration", "@codependix/nx"],
      ["an empty registration", {}],
      ["a non-string path", { configurationPath: 7, gateTargetName: false }],
      ["an empty path", { configurationPath: "", gateTargetName: "" }],
      ["only a target name", { gateTargetName: "boundaries" }],
    ])(
      "refuses a registration with no usable path given %s",
      (_description, options) => {
        expect.hasAssertions();

        expect(() => service.resolvePluginOptions({ options })).toThrow(
          "`configurationPath`",
        );
      },
    );

    it("falls back to the default target name when the registered one is unusable", () => {
      expect.hasAssertions();

      // A typo in nx.json must not stop the project graph from being built.
      expect(
        service.resolvePluginOptions({
          options: {
            configurationPath: "codependix.config.ts",
            gateTargetName: 3,
          },
        }),
      ).toStrictEqual({
        configurationPath: "codependix.config.ts",
        gateTargetName: "codependix-gate",
      });
    });
  });

  describe("readRegisteredOptions", () => {
    it("returns the options this plugin is registered with", () => {
      expect.hasAssertions();

      expect(
        service.readRegisteredOptions({
          plugins: [
            "@nx/js",
            { options: { gateTargetName: "other" }, plugin: "@other/nx" },
            {
              options: { configurationPath: "registered.config.ts" },
              plugin: "@codependix/nx",
            },
          ],
        }),
      ).toStrictEqual({ configurationPath: "registered.config.ts" });
    });

    it.each([
      ["no nx.json", undefined],
      ["a null nx.json", null],
      ["no plugins", {}],
      ["plugins that are not a list", { plugins: "@codependix/nx" }],
      ["a registration without options", { plugins: ["@codependix/nx"] }],
      ["a null plugin entry", { plugins: [null] }],
      ["only other plugins", { plugins: [{ plugin: "@other/nx" }] }],
    ])("returns nothing given %s", (_description, nxConfiguration) => {
      expect.hasAssertions();
      expect(service.readRegisteredOptions(nxConfiguration)).toBeUndefined();
    });
  });
});
