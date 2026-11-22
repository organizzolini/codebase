import { ConfigurationPathRequiredError } from "@codometer/configuration";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { OptionsService } from "./options.service";

/** A configuration path, as a registration writes it. */
const PATH = "codometer.config.ts";

describe(OptionsService, () => {
  let service: OptionsService;

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(OptionsService));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(OptionsService);

    expect(instance).toBeInstanceOf(OptionsService);
  });

  describe("resolvePluginOptions", () => {
    it("reads every option a registration gives", () => {
      expect.hasAssertions();

      expect(
        service.resolvePluginOptions({
          command: "node codometer.mjs",
          inputs: ["{workspaceRoot}/a.json"],
          limitConfigurationPath: "configuration/codometer.limit.config.ts",
          limitTargetName: "fast",
          projectConfigurationPath: "configuration/codometer.config.ts",
          weighTargetName: "heavy",
        }),
      ).toStrictEqual({
        command: "node codometer.mjs",
        inputs: ["{workspaceRoot}/a.json"],
        limitConfigurationPath: "configuration/codometer.limit.config.ts",
        limitTargetName: "fast",
        projectConfigurationPath: "configuration/codometer.config.ts",
        weighTargetName: "heavy",
      });
    });

    it.each([
      ["nothing", undefined],
      ["null", null],
      ["a string", "codometer"],
      ["an empty object", {}],
      ["a non-string path", { projectConfigurationPath: 7 }],
      ["a blank path", { projectConfigurationPath: "  " }],
    ])(
      "refuses to guess the configuration path given %s",
      (_description, options) => {
        expect.hasAssertions();
        expect(() => service.resolvePluginOptions(options)).toThrow(
          ConfigurationPathRequiredError,
        );
        expect(() => service.resolvePluginOptions(options)).toThrow(
          "projectConfigurationPath is required",
        );
      },
    );

    it.each([
      [
        "non-string names",
        { command: false, limitTargetName: 7, weighTargetName: null },
      ],
      [
        "blank names",
        { command: "", limitTargetName: "  ", weighTargetName: "" },
      ],
    ])("falls back to the default names given %s", (_description, options) => {
      expect.hasAssertions();
      // A typo in a name must not stop the project graph being built.
      expect(
        service.resolvePluginOptions({
          ...options,
          projectConfigurationPath: PATH,
        }),
      ).toStrictEqual({
        command: "codometer",
        inputs: [],
        limitConfigurationPath: undefined,
        limitTargetName: "codometer-limit",
        projectConfigurationPath: PATH,
        weighTargetName: "codometer-weigh",
      });
    });

    it("overrides one option without disturbing the others", () => {
      expect.hasAssertions();

      expect(
        service.resolvePluginOptions({
          command: "pnpm exec codometer",
          projectConfigurationPath: PATH,
        }),
      ).toStrictEqual({
        command: "pnpm exec codometer",
        inputs: [],
        limitConfigurationPath: undefined,
        limitTargetName: "codometer-limit",
        projectConfigurationPath: PATH,
        weighTargetName: "codometer-weigh",
      });
    });

    it.each([
      ["a list", ["a", "b"], ["a", "b"]],
      ["untrimmed and blank entries", [" a ", "", "  "], ["a"]],
      ["non-string entries", ["a", 7, null], ["a"]],
      [
        "input objects, which pass through",
        ["a", { externalDependencies: ["@codometer/cli"] }, [1]],
        ["a", { externalDependencies: ["@codometer/cli"] }],
      ],
      ["a bare string", "a", []],
      ["nothing", undefined, []],
    ])(
      "reads the declared inputs from %s",
      (_description, inputs, expected) => {
        expect.hasAssertions();
        expect(
          service.resolvePluginOptions({
            inputs,
            projectConfigurationPath: PATH,
          }).inputs,
        ).toStrictEqual(expected);
      },
    );
  });
});
