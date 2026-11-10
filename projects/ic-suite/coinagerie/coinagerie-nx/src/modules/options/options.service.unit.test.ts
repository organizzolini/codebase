import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { OptionsService } from "./options.service";

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
        }),
      ).toStrictEqual({
        checkTargetName: "glossary",
        command: "node coinagerie.mjs",
        inputs: ["{workspaceRoot}/GLOSSARY.md"],
      });
    });

    it.each([
      ["nothing", undefined],
      ["null", null],
      ["a string", "coinagerie"],
      ["an empty object", {}],
      ["non-string names", { checkTargetName: 7, command: false }],
      ["blank names", { checkTargetName: "  ", command: "" }],
    ])("falls back to every default given %s", (_description, options) => {
      expect.hasAssertions();

      // A typo in a registration must not stop the project graph being built.
      expect(service.resolvePluginOptions(options)).toStrictEqual({
        checkTargetName: "coinagerie-check",
        command: "coinagerie",
        inputs: [],
      });
    });

    it("overrides one option without disturbing the others", () => {
      expect.hasAssertions();

      expect(
        service.resolvePluginOptions({ command: "pnpm exec coinagerie" }),
      ).toStrictEqual({
        checkTargetName: "coinagerie-check",
        command: "pnpm exec coinagerie",
        inputs: [],
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
        expect(service.resolvePluginOptions({ inputs }).inputs).toStrictEqual(
          expected,
        );
      },
    );
  });
});
