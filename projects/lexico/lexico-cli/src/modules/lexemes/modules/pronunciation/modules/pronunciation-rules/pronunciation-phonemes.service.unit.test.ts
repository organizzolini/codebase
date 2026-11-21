import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { PronunciationPhonemesService } from "./pronunciation-phonemes.service";

describe(PronunciationPhonemesService, () => {
  let service: PronunciationPhonemesService;

  beforeAll(async () => {
    const built = await buildTestingModule(PronunciationPhonemesService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(PronunciationPhonemesService);

    expect(instance).toBeInstanceOf(PronunciationPhonemesService);
  });

  it("should return a string phoneme when key points to string value", () => {
    const value = service.getStringPhoneme({ a: "a" }, "a");

    expect(value).toBe("a");
  });

  it("should return empty string when key points to nested value", () => {
    const value = service.getStringPhoneme({ a: [["a"]] }, "a");

    expect(value).toBe("");
  });

  it("should return empty string when key is missing", () => {
    const value = service.getStringPhoneme({ a: "a" }, "missing");

    expect(value).toBe("");
  });

  it("should return empty string when value is null", () => {
    const value = service.getStringPhoneme(
      { a: null } as unknown as Record<string, string | string[][]>,
      "a",
    );

    expect(value).toBe("");
  });
});
