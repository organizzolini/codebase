import { afterEach, describe, expect, it, vi } from "vitest";

const createLexicoDatabaseModuleMock = (
  formCaseValues: unknown,
): {
  formCaseValues: unknown;
  formGerundCaseValues: string[];
  formMoodValues: string[];
  formNonFiniteTenseValues: string[];
  formNumberValues: string[];
  formPersonValues: string[];
  formSupineCaseValues: string[];
  formTenseValues: string[];
  formVoiceValues: string[];
  partOfSpeechEnumValues: string[];
} => ({
  formCaseValues,
  formGerundCaseValues: ["accusative"],
  formMoodValues: ["indicative"],
  formNonFiniteTenseValues: ["present"],
  formNumberValues: ["singular"],
  formPersonValues: ["first"],
  formSupineCaseValues: ["accusative"],
  formTenseValues: ["present"],
  formVoiceValues: ["active"],
  partOfSpeechEnumValues: ["noun"],
});

describe("forms.constants normalization guards", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@codebase/lexico-db");
  });

  it("returns empty lists when form enums are not arrays", async () => {
    vi.doMock("@codebase/lexico-db", () => createLexicoDatabaseModuleMock({}));

    const constants = await import("./forms.constants");

    expect(constants.formCaseValueList).toStrictEqual([]);
  });

  it("filters non-string values from mixed form enums", async () => {
    vi.doMock("@codebase/lexico-db", () =>
      createLexicoDatabaseModuleMock(["nominative", 1, "genitive"]),
    );

    const constants = await import("./forms.constants");

    expect(constants.formCaseValueList).toStrictEqual([
      "nominative",
      "genitive",
    ]);
  });
});
