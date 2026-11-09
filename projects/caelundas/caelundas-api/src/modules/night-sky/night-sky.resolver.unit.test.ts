import { Test } from "@nestjs/testing";
import { getEntityManagerToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { NightSkyColorsService } from "./night-sky-colors.service";
import { NightSkyEclipticService } from "./night-sky-ecliptic.service";
import { NightSkyInputService } from "./night-sky-input.service";
import { NightSkyLinesService } from "./night-sky-lines.service";
import { NightSkyOptionsService } from "./night-sky-options.service";
import { NightSkyProjectionService } from "./night-sky-projection.service";
import { NightSkySiderealTimeService } from "./night-sky-sidereal-time.service";
import { NightSkyStarsService } from "./night-sky-stars.service";
import { NightSkySvgService } from "./night-sky-svg.service";
import { NightSkyViewService } from "./night-sky-view.service";
import { NightSkyResolver } from "./night-sky.resolver";
import { NightSkyService } from "./night-sky.service";

describe(NightSkyResolver, () => {
  let resolver: NightSkyResolver;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NightSkyResolver,
        NightSkyColorsService,
        NightSkyEclipticService,
        NightSkyInputService,
        NightSkyLinesService,
        NightSkyOptionsService,
        NightSkyProjectionService,
        NightSkySiderealTimeService,
        NightSkyStarsService,
        NightSkySvgService,
        NightSkyViewService,
        NightSkyService,
        // A database holding no stars: the sky it draws is only the ecliptic.
        {
          provide: getEntityManagerToken(),
          useValue: {
            getRepository: () => ({
              find: vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
            }),
          },
        },
      ],
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
