import moment from "moment-timezone";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { MartianPhaseService } from "./martian-phase.service";
import { MercurianPhaseService } from "./mercurian-phase.service";
import { PhasesService } from "./phases.service";
import { VenusianPhaseService } from "./venusian-phase.service";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { DetectPlanetaryEventsArguments } from "./phases.types";

const createEvent = (
  description: string,
  tags: string[],
): DetectedCalendarEvent => {
  const timestamp = moment.utc("2024-01-01T00:00:00.000Z");
  return {
    description,
    end: timestamp,
    start: timestamp,
    summary: description,
    tags,
  };
};

const createMockPhaseInputs = (): DetectPlanetaryEventsArguments => {
  const ephemeris = {
    "2024-01-01T00:00:00.000Z": {
      latitude: 0,
      longitude: 100,
    },
  };
  const illuminationEphemeris = {
    "2024-01-01T00:00:00.000Z": {
      illumination: 50,
      magnitude: -1,
      phaseAngle: 90,
    },
  };

  return {
    coordinateEphemerisByBody: {
      ceres: ephemeris,
      chiron: ephemeris,
      juno: ephemeris,
      jupiter: ephemeris,
      lilith: ephemeris,
      "lunar apogee": ephemeris,
      "lunar perigee": ephemeris,
      mars: ephemeris,
      mercury: ephemeris,
      moon: ephemeris,
      neptune: ephemeris,
      "north lunar node": ephemeris,
      pallas: ephemeris,
      pluto: ephemeris,
      saturn: ephemeris,
      "south lunar node": ephemeris,
      sun: ephemeris,
      uranus: ephemeris,
      venus: ephemeris,
      vesta: ephemeris,
    },
    illuminationEphemerisByBody: {
      mars: illuminationEphemeris,
      mercury: illuminationEphemeris,
      moon: illuminationEphemeris,
      sun: illuminationEphemeris,
      venus: illuminationEphemeris,
    },
    minute: moment.utc("2024-01-01T00:00:00.000Z"),
  };
};

describe(PhasesService, () => {
  let service: PhasesService;

  const venusianPhaseService = {
    getVenusianPhaseEvents:
      vi.fn<VenusianPhaseService["getVenusianPhaseEvents"]>(),
    getVenusianPhaseProgressiveEvents:
      vi.fn<VenusianPhaseService["getVenusianPhaseProgressiveEvents"]>(),
  };

  const mercurianPhaseService = {
    getMercurianPhaseEvents:
      vi.fn<MercurianPhaseService["getMercurianPhaseEvents"]>(),
    getMercurianPhaseProgressiveEvents:
      vi.fn<MercurianPhaseService["getMercurianPhaseProgressiveEvents"]>(),
  };

  const martianPhaseService = {
    getMartianPhaseEvents:
      vi.fn<MartianPhaseService["getMartianPhaseEvents"]>(),
    getMartianPhaseProgressiveEvents:
      vi.fn<MartianPhaseService["getMartianPhaseProgressiveEvents"]>(),
  };

  const testingModuleOptions = {
    providers: [
      {
        provide: VenusianPhaseService,
        useValue: venusianPhaseService,
      },
      {
        provide: MercurianPhaseService,
        useValue: mercurianPhaseService,
      },
      {
        provide: MartianPhaseService,
        useValue: martianPhaseService,
      },
    ],
  };

  beforeAll(async () => {
    const { instance } = await buildTestingModule(
      PhasesService,
      testingModuleOptions,
    );

    service = instance;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      PhasesService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(PhasesService);
  });

  describe("detect", () => {
    it("delegates event detection to all planet-specific services", () => {
      venusianPhaseService.getVenusianPhaseEvents.mockReturnValue([
        createEvent("Venus Morning Rise", ["Planetary Phase", "Venusian"]),
      ]);
      mercurianPhaseService.getMercurianPhaseEvents.mockReturnValue([
        createEvent("Mercury Morning Rise", ["Planetary Phase", "Mercurian"]),
      ]);
      martianPhaseService.getMartianPhaseEvents.mockReturnValue([
        createEvent("Mars Morning Rise", ["Planetary Phase", "Martian"]),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const result = service.detect(createMockPhaseInputs());

      expect(venusianPhaseService.getVenusianPhaseEvents).toHaveBeenCalledTimes(
        1,
      );
      expect(
        mercurianPhaseService.getMercurianPhaseEvents,
      ).toHaveBeenCalledTimes(1);
      expect(martianPhaseService.getMartianPhaseEvents).toHaveBeenCalledTimes(
        1,
      );
      expect(result).toHaveLength(3);
    });
  });

  describe("detectProgressive", () => {
    it("routes progressive events by planet tag", () => {
      const venusianProgressiveEvent = createEvent("Venus Morning Star", [
        "Planetary Phase",
        "Venusian",
      ]);
      const mercurianProgressiveEvent = createEvent("Mercury Morning Star", [
        "Planetary Phase",
        "Mercurian",
      ]);
      const martianProgressiveEvent = createEvent("Mars Morning Star", [
        "Planetary Phase",
        "Martian",
      ]);

      venusianPhaseService.getVenusianPhaseProgressiveEvents.mockReturnValue([
        venusianProgressiveEvent,
      ]);
      mercurianPhaseService.getMercurianPhaseProgressiveEvents.mockReturnValue([
        mercurianProgressiveEvent,
      ]);
      martianPhaseService.getMartianPhaseProgressiveEvents.mockReturnValue([
        martianProgressiveEvent,
      ]);

      const result = service.detectProgressive([
        createEvent("Venus Morning Rise", ["Planetary Phase", "Venusian"]),
        createEvent("Mercury Morning Rise", ["Planetary Phase", "Mercurian"]),
        createEvent("Mars Morning Rise", ["Planetary Phase", "Martian"]),
        createEvent("Unrelated Event", ["Astronomy"]),
      ]);

      expect(
        venusianPhaseService.getVenusianPhaseProgressiveEvents,
      ).toHaveBeenCalledTimes(1);
      expect(
        mercurianPhaseService.getMercurianPhaseProgressiveEvents,
      ).toHaveBeenCalledTimes(1);
      expect(
        martianPhaseService.getMartianPhaseProgressiveEvents,
      ).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([
        venusianProgressiveEvent,
        mercurianProgressiveEvent,
        martianProgressiveEvent,
      ]);
    });

    it("returns empty list when no planetary phase events are present", () => {
      venusianPhaseService.getVenusianPhaseProgressiveEvents.mockReturnValue(
        [],
      );
      mercurianPhaseService.getMercurianPhaseProgressiveEvents.mockReturnValue(
        [],
      );
      martianPhaseService.getMartianPhaseProgressiveEvents.mockReturnValue([]);

      const result = service.detectProgressive([
        createEvent("Unrelated Event", ["Astronomy"]),
      ]);

      expect(result).toStrictEqual([]);
    });
  });
});
