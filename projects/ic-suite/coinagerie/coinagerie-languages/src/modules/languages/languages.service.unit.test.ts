import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

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
});
