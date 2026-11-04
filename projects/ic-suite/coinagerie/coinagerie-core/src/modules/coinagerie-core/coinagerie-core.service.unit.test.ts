import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { CoinagerieCoreService } from "./coinagerie-core.service";

describe(CoinagerieCoreService, () => {
  let service: CoinagerieCoreService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [CoinagerieCoreService],
    }).compile();

    service = await module.resolve(CoinagerieCoreService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });
});
