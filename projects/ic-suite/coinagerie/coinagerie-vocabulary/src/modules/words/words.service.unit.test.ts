import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { WordsService } from "./words.service";

describe(WordsService, () => {
  let service: WordsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [WordsService],
    }).compile();

    service = await module.resolve(WordsService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("splitIdentifier", () => {
    it.each([
      ["CallidescopeGateService", ["callidescope", "gate", "service"]],
      ["HTTPServer", ["http", "server"]],
      ["XMLHttpRequest", ["xml", "http", "request"]],
      ["utf8", ["utf8"]],
      ["base64Encode", ["base64", "encode"]],
      ["getUTF8String", ["get", "utf8", "string"]],
      ["HTTP2Server", ["http2", "server"]],
      ["snake_case_name", ["snake", "case", "name"]],
      ["SCREAMING_SNAKE_CASE", ["screaming", "snake", "case"]],
      ["kebab-case-name", ["kebab", "case", "name"]],
      ["dotted.name.parts", ["dotted", "name", "parts"]],
      ["#privateField", ["private", "field"]],
      ["$scope", ["scope"]],
      ["camelCase", ["camel", "case"]],
      ["Café", ["café"]],
    ])("splits %s", (raw, expected) => {
      expect(service.splitIdentifier(raw)).toStrictEqual(expected);
    });

    it.each([
      ["one-letter words", "x", []],
      ["one-letter parts", "aValue_b", ["value"]],
      ["pure numbers", "version_2024_release", ["version", "release"]],
      ["a number with a trailing digit run", "x86_64", ["x86"]],
      ["nothing at all", "", []],
      ["only separators", "__--..", []],
    ])("drops %s", (_case, raw, expected) => {
      expect(service.splitIdentifier(raw)).toStrictEqual(expected);
    });
  });

  describe("splitPath", () => {
    it.each([
      [
        "aspect-phase-emoji.service.ts",
        ["aspect", "phase", "emoji", "service"],
      ],
      [
        "src/modules/glossary/glossary.service.unit.test.ts",
        ["src", "modules", "glossary", "glossary", "service", "unit", "test"],
      ],
      [".gitignore", ["gitignore"]],
      ["images/logoMark.png", ["images", "logo", "mark"]],
      ["Makefile", ["makefile"]],
      ["v2/a.md", ["v2"]],
    ])("splits %s, dropping only the final extension", (filePath, expected) => {
      expect(service.splitPath(filePath)).toStrictEqual(expected);
    });
  });
});
