import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TypescriptModule } from "../typescript/typescript.module";

import { LanguagesService } from "./languages.service";

describe(LanguagesService, () => {
  let service: LanguagesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypescriptModule],
      providers: [LanguagesService],
    }).compile();

    service = await module.resolve(LanguagesService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it.each([
    "source.ts",
    "component.tsx",
    "module.mts",
    "module.cts",
    "types.d.ts",
    "script.js",
    "component.jsx",
    "module.mjs",
    "module.cjs",
    "SHOUTING.TS",
    "nested/folder/file.ts",
  ])("finds a tokenizer for %s", (filePath) => {
    const tokenizer = service.tokenizerFor(filePath);

    expect(tokenizer?.("const foundName = 1;", filePath)).toStrictEqual([
      "foundName",
    ]);
  });

  it.each([
    "README.md",
    "image.png",
    "Makefile",
    ".gitignore",
    "archive.ts.gz",
  ])("finds no tokenizer for %s", (filePath) => {
    expect(service.tokenizerFor(filePath)).toBeUndefined();
  });

  describe("languagesService when its dependencies are not yet defined", () => {
    afterEach(() => {
      vi.doUnmock("../typescript/typescript.service");
      vi.resetModules();
    });

    it("records Object as each injection type, as a circular import would", async () => {
      vi.resetModules();
      vi.doMock("../typescript/typescript.service", () => ({
        TypescriptService: undefined,
      }));

      const { LanguagesService: Reloaded } =
        await import("./languages.service");

      expect(Reflect.getMetadata("design:paramtypes", Reloaded)).toStrictEqual([
        Object,
      ]);
    });
  });
});
