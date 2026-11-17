import { getEntityManagerToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { NightSkyEclipticService } from "./modules/astronomy/night-sky-ecliptic.service";
import { NightSkyProjectionService } from "./modules/astronomy/night-sky-projection.service";
import { NightSkySiderealTimeService } from "./modules/astronomy/night-sky-sidereal-time.service";
import { NightSkyColorsService } from "./modules/drawing/night-sky-colors.service";
import { NightSkyLinesService } from "./modules/drawing/night-sky-lines.service";
import { NightSkyStarsService } from "./modules/drawing/night-sky-stars.service";
import { NightSkySvgService } from "./modules/drawing/night-sky-svg.service";
import { NightSkyViewService } from "./modules/drawing/night-sky-view.service";
import { NightSkyInputService } from "./modules/options/night-sky-input.service";
import { NightSkyOptionsService } from "./modules/options/night-sky-options.service";
import { NightSkyResolver } from "./night-sky.resolver";
import { NightSkyService } from "./night-sky.service";

/** No stars in the database; only the ecliptic is drawn. */
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
      providers: [
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
        EMPTY_DATABASE,
      ],
    });

    await module.get(NightSkyService).onModuleInit();
    resolver = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(NightSkyResolver, {
      providers: [
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
        EMPTY_DATABASE,
      ],
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
