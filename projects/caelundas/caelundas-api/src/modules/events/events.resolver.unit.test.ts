import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { EventsResolver } from "./events.resolver";

describe(EventsResolver, () => {
  let resolver: EventsResolver;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [EventsResolver],
    }).compile();

    resolver = await module.resolve(EventsResolver);
  });

  it("is defined", () => {
    expect(resolver).toBeDefined();
  });
});
