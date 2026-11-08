import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { DictionaryService } from "./dictionary.service";

describe(DictionaryService, () => {
  let service: DictionaryService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [DictionaryService],
    }).compile();

    service = await module.resolve(DictionaryService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });
});
