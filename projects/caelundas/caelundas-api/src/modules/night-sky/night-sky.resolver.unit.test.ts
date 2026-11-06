import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { NightSkyResolver } from "./night-sky.resolver";
import { NightSkyService } from "./night-sky.service";

describe(NightSkyResolver, () => {
  let resolver: NightSkyResolver;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [NightSkyResolver, NightSkyService],
    }).compile();

    await module.get(NightSkyService).onModuleInit();
    resolver = await module.resolve(NightSkyResolver);
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(resolver).toBeDefined();
  });

  it("answers the query with the service's sky", () => {
    expect.hasAssertions();

    expect(resolver.nightSky({ height: 600, width: 800 }).svg).toContain(
      "<svg",
    );
  });
});
