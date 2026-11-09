import { getEntityManagerToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { NightSkyResolver } from "./night-sky.resolver";
import { NightSkyService } from "./night-sky.service";

/** A database holding no stars: the sky it draws is only the ecliptic. */
const EMPTY_DATABASE = {
  provide: getEntityManagerToken(),
  useValue: {
    getRepository: () => ({
      find: vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
    }),
  },
};

describe(NightSkyResolver, () => {
  let resolver: NightSkyResolver;

  beforeAll(async () => {
    const { instance, module } = await buildTestingModule(NightSkyResolver, {
      providers: [NightSkyService, EMPTY_DATABASE],
    });

    await module.get(NightSkyService).onModuleInit();
    resolver = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(NightSkyResolver, {
      providers: [NightSkyService, EMPTY_DATABASE],
    });

    expect(instance).toBeInstanceOf(NightSkyResolver);
  });

  it("answers the query with the service's sky", () => {
    expect.hasAssertions();

    expect(resolver.nightSky({ height: 600, width: 800 }).svg).toContain(
      "<svg",
    );
  });
});
