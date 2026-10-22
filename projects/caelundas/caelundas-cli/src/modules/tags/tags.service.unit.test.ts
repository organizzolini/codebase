import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { TagsService } from "./tags.service";

describe(TagsService, () => {
  let service: TagsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [TagsService],
    }).compile();

    service = await module.resolve(TagsService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });
});
