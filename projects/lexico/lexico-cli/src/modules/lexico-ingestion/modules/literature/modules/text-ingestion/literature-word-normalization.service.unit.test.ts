import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { LiteratureWordNormalizationService } from "./literature-word-normalization.service";

describe(LiteratureWordNormalizationService, () => {
  let service: LiteratureWordNormalizationService;

  beforeAll(async () => {
    const built = await buildTestingModule(LiteratureWordNormalizationService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      LiteratureWordNormalizationService,
    );

    expect(instance).toBeInstanceOf(LiteratureWordNormalizationService);
  });

  describe("escapeCapitals", () => {
    it("replaces each capital with an underscore and its lowercase form", () => {
      expect(service.escapeCapitals("CaesarAugustus")).toBe("_caesar_augustus");
    });

    it("leaves an already lowercase word alone", () => {
      expect(service.escapeCapitals("caesar")).toBe("caesar");
    });
  });

  describe("normalize", () => {
    it("strips diacritics and lowercases", () => {
      expect(service.normalize("  Rōmā  ")).toBe("roma");
    });

    it("leaves a plain word alone", () => {
      expect(service.normalize("roma")).toBe("roma");
    });
  });
});
