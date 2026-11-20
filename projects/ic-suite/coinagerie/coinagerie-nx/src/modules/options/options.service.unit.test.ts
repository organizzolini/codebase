import { ConfigurationPathRequiredError } from "@coinagerie/configuration";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { OptionsService } from "./options.service";

/** A configuration path, as a registration writes it. */
const PATH = "coinagerie.config.ts";

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
          checkTargetName: "glossary",
          command: "node coinagerie.mjs",
          inputs: ["{workspaceRoot}/GLOSSARY.md"],
          projectConfigurationPath: "configuration/coinagerie.config.ts",
        }),
      ).toStrictEqual({
        checkTargetName: "glossary",
        command: "node coinagerie.mjs",
        inputs: ["{workspaceRoot}/GLOSSARY.md"],
        projectConfigurationPath: "configuration/coinagerie.config.ts",
      });
    });

    it.each([
      ["nothing", undefined],
      ["null", null],
      ["a string", "coinagerie"],
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
      ["non-string names", { checkTargetName: 7, command: false }],
      ["blank names", { checkTargetName: "  ", command: "" }],
    ])("falls back to the default names given %s", (_description, options) => {
      expect.hasAssertions();
      // A typo in a name must not stop the project graph being built.
      expect(
        service.resolvePluginOptions({
          ...options,
          projectConfigurationPath: PATH,
        }),
      ).toStrictEqual({
        checkTargetName: "coinagerie-check",
        command: "coinagerie",
        inputs: [],
        projectConfigurationPath: PATH,
      });
    });

    it("overrides one option without disturbing the others", () => {
      expect.hasAssertions();

      expect(
        service.resolvePluginOptions({
          command: "pnpm exec coinagerie",
          projectConfigurationPath: PATH,
        }),
      ).toStrictEqual({
        checkTargetName: "coinagerie-check",
        command: "pnpm exec coinagerie",
        inputs: [],
        projectConfigurationPath: PATH,
      });
    });

    it.each([
      ["a list", ["a", "b"], ["a", "b"]],
      ["untrimmed and blank entries", [" a ", "", "  "], ["a"]],
      ["non-string entries", ["a", 7, null], ["a"]],
      [
        "input objects, which pass through",
        ["a", { externalDependencies: ["@coinagerie/cli"] }, [1]],
        ["a", { externalDependencies: ["@coinagerie/cli"] }],
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
