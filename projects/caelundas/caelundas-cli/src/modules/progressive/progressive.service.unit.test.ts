import moment from "moment-timezone";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { AspectsService } from "../aspects/aspects.service";
import { AnnualSolarCycleService } from "../perfective/modules/annual-solar-cycle/annual-solar-cycle.service";
import { DailyCyclesService } from "../perfective/modules/daily-cycles/daily-cycles.service";
import { EclipsesService } from "../perfective/modules/eclipses/eclipses.service";
import { IngressesService } from "../perfective/modules/ingresses/ingresses.service";
import { MonthlyLunarCycleService } from "../perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service";
import { PhasesService } from "../perfective/modules/phases/phases.service";
import { RetrogradesService } from "../perfective/modules/retrogrades/retrogrades.service";
import { TwilightsService } from "../perfective/modules/twilights/twilights.service";

import { ProgressiveUtilitiesService } from "./progressive-utilities.service";
import {
  EDGE_EVENTS_FINDERS_TOKEN,
  SPAN_BOUNDARY_RULES,
} from "./progressive.constants";
import { ProgressiveService } from "./progressive.service";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { EdgeEventsFinder } from "../ephemeris/modules/boundary-search/boundary-search.types";
import type { BuiltTestingModule } from "@codebase/testing/nestjs";
/** An event with the tags, an instant when it has no end. */
function event(
  summary: string,
  tags: string[],
  start: string,
  end = start,
): DetectedCalendarEvent {
  return {
    description: summary,
    end: moment.utc(end),
    start: moment.utc(start),
    summary,
    tags,
  };
}

function makeEvent(summary: string): DetectedCalendarEvent {
  return {
    description: summary,
    end: moment.utc("2025-06-15T12:00:00Z"),
    start: moment.utc("2025-06-15T12:00:00Z"),
    summary,
    tags: [],
  };
}

describe(ProgressiveService, () => {
  let service: ProgressiveService;
  let logger: BuiltTestingModule<ProgressiveService>["logger"];
  let utilitiesService: ProgressiveUtilitiesService;

  const annualSolarCycleMock = {
    detectProgressive: vi.fn<AnnualSolarCycleService["detectProgressive"]>(),
  };
  const aspectsMock = {
    detectProgressive: vi.fn<AspectsService["detectProgressive"]>(),
  };
  const dailyCyclesMock = {
    detectProgressive: vi.fn<DailyCyclesService["detectProgressive"]>(),
  };
  const eclipsesMock = {
    detectProgressive: vi.fn<EclipsesService["detectProgressive"]>(),
  };
  const ingressesMock = {
    detectProgressive: vi.fn<IngressesService["detectProgressive"]>(),
  };
  const monthlyLunarCycleMock = {
    detectProgressive: vi.fn<MonthlyLunarCycleService["detectProgressive"]>(),
  };
  const phasesMock = {
    detectProgressive: vi.fn<PhasesService["detectProgressive"]>(),
  };
  const retrogradesMock = {
    detectProgressive: vi.fn<RetrogradesService["detectProgressive"]>(),
  };
  const twilightsMock = {
    detectProgressive: vi.fn<TwilightsService["detectProgressive"]>(),
  };

  const testingModuleOptions = {
    providers: [
      { provide: AnnualSolarCycleService, useValue: annualSolarCycleMock },
      { provide: AspectsService, useValue: aspectsMock },
      { provide: DailyCyclesService, useValue: dailyCyclesMock },
      { provide: EclipsesService, useValue: eclipsesMock },
      { provide: IngressesService, useValue: ingressesMock },
      { provide: MonthlyLunarCycleService, useValue: monthlyLunarCycleMock },
      { provide: PhasesService, useValue: phasesMock },
      { provide: RetrogradesService, useValue: retrogradesMock },
      { provide: TwilightsService, useValue: twilightsMock },
      { provide: EDGE_EVENTS_FINDERS_TOKEN, useValue: [] },
      ProgressiveUtilitiesService,
    ],
  };

  beforeAll(async () => {
    const {
      instance,
      logger: builtLogger,
      module,
    } = await buildTestingModule(ProgressiveService, testingModuleOptions);
    logger = builtLogger;

    service = instance;
    utilitiesService = await module.resolve(ProgressiveUtilitiesService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("detect", () => {
    it("returns an empty array when all sub-services return nothing", () => {
      for (const subMock of [
        annualSolarCycleMock,
        aspectsMock,
        dailyCyclesMock,
        eclipsesMock,
        ingressesMock,
        monthlyLunarCycleMock,
        phasesMock,
        retrogradesMock,
        twilightsMock,
      ]) {
        subMock.detectProgressive.mockReturnValue([]);
      }

      const result = service.detect([]);

      expect(result).toStrictEqual([]);
    });

    it("aggregates events from all sub-services into a single flat array", () => {
      const aspectEvent = makeEvent("aspect");
      const retrogradeEvent = makeEvent("retrograde");
      const eclipseEvent = makeEvent("eclipse");

      aspectsMock.detectProgressive.mockReturnValue([aspectEvent]);
      retrogradesMock.detectProgressive.mockReturnValue([retrogradeEvent]);
      eclipsesMock.detectProgressive.mockReturnValue([eclipseEvent]);
      ingressesMock.detectProgressive.mockReturnValue([]);
      monthlyLunarCycleMock.detectProgressive.mockReturnValue([]);
      twilightsMock.detectProgressive.mockReturnValue([]);
      phasesMock.detectProgressive.mockReturnValue([]);
      annualSolarCycleMock.detectProgressive.mockReturnValue([]);

      const result = service.detect([]);

      expect(result).toContain(aspectEvent);
      expect(result).toContain(retrogradeEvent);
      expect(result).toContain(eclipseEvent);
      expect(result).toHaveLength(3);
    });

    it("forwards the perfective events array to every sub-service", () => {
      const perfectiveEvents = [makeEvent("perfective")];

      for (const subMock of [
        annualSolarCycleMock,
        aspectsMock,
        dailyCyclesMock,
        eclipsesMock,
        ingressesMock,
        monthlyLunarCycleMock,
        phasesMock,
        retrogradesMock,
        twilightsMock,
      ]) {
        subMock.detectProgressive.mockReturnValue([]);
      }

      service.detect(perfectiveEvents);

      for (const subMock of [
        annualSolarCycleMock,
        dailyCyclesMock,
        eclipsesMock,
        monthlyLunarCycleMock,
        phasesMock,
        twilightsMock,
      ]) {
        expect(subMock.detectProgressive).toHaveBeenCalledWith(
          perfectiveEvents,
        );
      }

      for (const subMock of [aspectsMock, ingressesMock, retrogradesMock]) {
        expect(subMock.detectProgressive).toHaveBeenCalledWith(
          perfectiveEvents,
          undefined,
        );
      }
    });

    it("hands the aspects, ingresses and retrogrades the whole local days the sweep covered", () => {
      const perfectiveEvents = [makeEvent("perfective")];
      for (const subMock of [
        annualSolarCycleMock,
        aspectsMock,
        dailyCyclesMock,
        eclipsesMock,
        ingressesMock,
        monthlyLunarCycleMock,
        phasesMock,
        retrogradesMock,
        twilightsMock,
      ]) {
        subMock.detectProgressive.mockReturnValue([]);
      }

      service.detect(perfectiveEvents, {
        end: moment.tz("2026-03-21", "America/New_York"),
        latitude: 39.949_309,
        longitude: -75.171_69,
        start: moment.tz("2026-03-20", "America/New_York"),
        timezone: "America/New_York",
      });

      for (const subMock of [aspectsMock, ingressesMock, retrogradesMock]) {
        const [, window] = subMock.detectProgressive.mock.calls.at(-1) ?? [];

        expect(window?.start.toISOString()).toBe("2026-03-20T04:00:00.000Z");
        expect(window?.end.toISOString()).toBe("2026-03-22T03:59:00.000Z");
      }
    });

    it("gives the span builders the edge events the finders add, without repeating one the sweep found", async () => {
      const detected = makeEvent("detected");
      const edge = { ...makeEvent("edge"), tags: ["Edge"] };
      const finder = {
        findEdgeEvents: vi
          .fn<EdgeEventsFinder["findEdgeEvents"]>()
          .mockReturnValue([edge, detected]),
      };
      const { instance: withFinders } = await buildTestingModule(
        ProgressiveService,
        {
          providers: [
            ...testingModuleOptions.providers,
            { provide: EDGE_EVENTS_FINDERS_TOKEN, useValue: [finder] },
          ],
        },
      );
      for (const subMock of [
        annualSolarCycleMock,
        aspectsMock,
        dailyCyclesMock,
        eclipsesMock,
        ingressesMock,
        monthlyLunarCycleMock,
        phasesMock,
        retrogradesMock,
        twilightsMock,
      ]) {
        subMock.detectProgressive.mockReturnValue([]);
      }
      const input = {
        end: moment.tz("2026-03-21", "America/New_York"),
        latitude: 39.949_309,
        longitude: -75.171_69,
        start: moment.tz("2026-03-20", "America/New_York"),
        timezone: "America/New_York",
      };

      withFinders.detect([detected], input);

      expect(finder.findEdgeEvents).toHaveBeenCalledWith(
        expect.objectContaining({ start: expect.anything() }),
        input,
      );
      expect(monthlyLunarCycleMock.detectProgressive).toHaveBeenCalledWith([
        detected,
        edge,
      ]);
      expect(aspectsMock.detectProgressive).toHaveBeenCalledWith(
        [detected],
        expect.anything(),
      );
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      ProgressiveService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(ProgressiveService);
  });

  describe("pairProgressiveEvents", () => {
    it("returns an empty array when both inputs are empty", () => {
      const result = utilitiesService.pairProgressiveEvents([], [], "test");

      expect(result).toStrictEqual([]);
    });

    it("pairs beginnings with their corresponding endings", () => {
      const beginning1 = makeEvent("beginning-1");
      const ending1 = makeEvent("ending-1");
      const beginning2 = makeEvent("beginning-2");
      const ending2 = makeEvent("ending-2");

      const result = utilitiesService.pairProgressiveEvents(
        [beginning1, beginning2],
        [ending1, ending2],
        "test",
      );

      expect(result).toStrictEqual([
        [beginning1, ending1],
        [beginning2, ending2],
      ]);
    });

    it("truncates to the shorter list when counts differ", () => {
      const beginning1 = makeEvent("beginning-1");
      const beginning2 = makeEvent("beginning-2");
      const ending1 = makeEvent("ending-1");

      const result = utilitiesService.pairProgressiveEvents(
        [beginning1, beginning2],
        [ending1],
        "test",
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual([beginning1, ending1]);
    });

    it("emits a warning when an event is left unpaired", () => {
      const warnSpy = logger.warn.mockReturnValue(undefined);

      utilitiesService.pairProgressiveEvents(
        [makeEvent("a"), makeEvent("b")],
        [makeEvent("c")],
        "my-label",
      );

      expect(warnSpy).toHaveBeenCalledWith(
        "🔀 Unpaired progressive events",
        undefined,
        {
          label: "my-label",
          paired: 1,
          unpairedBeginnings: 1,
          unpairedEndings: 0,
        },
      );

      warnSpy.mockRestore();
    });

    it("does not warn when counts are equal", () => {
      const warnSpy = logger.warn.mockReturnValue(undefined);

      utilitiesService.pairProgressiveEvents(
        [makeEvent("a")],
        [makeEvent("b")],
        "test",
      );

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe("withoutSpanBoundaries", () => {
    /** The summaries the events keep, in order. */
    function kept(
      instants: DetectedCalendarEvent[],
      spans: DetectedCalendarEvent[],
    ): string[] {
      return service
        .withoutSpanBoundaries(instants, spans)
        .map((remaining) => remaining.summary);
    }

    it.each([
      ["aspect forming", "Forming", "Simple Aspect", "2026-01-01T00:00:00Z"],
      [
        "compound forming",
        "Forming",
        "Compound Aspect",
        "2026-01-01T00:00:00Z",
      ],
      [
        "aspect dissolving",
        "Dissolving",
        "Simple Aspect",
        "2026-01-02T00:00:00Z",
      ],
      [
        "moon phase",
        "Monthly Lunar Cycle",
        "Monthly Lunar Cycle",
        "2026-01-01T00:00:00Z",
      ],
      ["lunar apsis", "Lunar Apsides", "Lunar Apsides", "2026-01-02T00:00:00Z"],
      [
        "morning rise",
        "Morning Rise",
        "Planetary Phase",
        "2026-01-01T00:00:00Z",
      ],
      [
        "western elongation",
        "Western Elongation",
        "Planetary Phase",
        "2026-01-02T00:00:00Z",
      ],
      ["opposition", "Opposition", "Planetary Phase", "2026-01-01T00:00:00Z"],
      ["eclipse beginning", "Beginning", "Eclipse", "2026-01-01T00:00:00Z"],
      ["eclipse ending", "Ending", "Eclipse", "2026-01-02T00:00:00Z"],
      ["ingress", "Ingress", "Ingress", "2026-01-01T00:00:00Z"],
      [
        "solar year point",
        "Annual Solar Cycle",
        "Annual Solar Cycle",
        "2026-01-02T00:00:00Z",
      ],
      ["twilight boundary", "Twilight", "Twilight", "2026-01-01T00:00:00Z"],
    ])(
      "drops the %s instant a span of its family starts or ends on",
      (_name, instantTag, spanTag, at) => {
        const instant = event("instant", [instantTag], at);
        const span = event(
          "span",
          [spanTag],
          "2026-01-01T00:00:00Z",
          "2026-01-02T00:00:00Z",
        );

        expect(kept([instant], [span])).toStrictEqual([]);
      },
    );

    it("drops a station whether or not a span has it on its edge, as stations only build spans", () => {
      const station = event("station", ["Direction"], "2026-01-05T00:00:00Z");
      const span = event(
        "span",
        ["Retrogrades"],
        "2026-01-01T00:00:00Z",
        "2026-01-02T00:00:00Z",
      );

      expect(kept([station], [span])).toStrictEqual([]);
      expect(kept([station], [])).toStrictEqual([]);
    });

    it("keeps an instant no span has on its edge, and one on the edge of a span of another family", () => {
      const stay = event("stay", ["Beginning"], "2026-01-05T00:00:00Z");
      const ingress = event(
        "ingress-edge",
        ["Beginning"],
        "2026-01-01T00:00:00Z",
      );
      const span = event(
        "span",
        ["Ingress"],
        "2026-01-01T00:00:00Z",
        "2026-01-02T00:00:00Z",
      );

      expect(kept([stay], [])).toStrictEqual(["stay"]);
      expect(kept([ingress], [span])).toStrictEqual(["ingress-edge"]);
    });

    it("keeps a span of retrograde or direct motion", () => {
      const span = event(
        "span",
        ["Retrogrades", "Direction"],
        "2026-01-01T00:00:00Z",
        "2026-01-09T00:00:00Z",
      );

      expect(kept([span], [])).toStrictEqual(["span"]);
    });

    it("keeps an instant inside a span, such as an eclipse maximum or an exact aspect", () => {
      const span = event(
        "span",
        ["Eclipse", "Simple Aspect"],
        "2026-01-01T00:00:00Z",
        "2026-01-03T00:00:00Z",
      );
      const maximum = event(
        "maximum",
        ["Eclipse", "Maximum"],
        "2026-01-02T00:00:00Z",
      );
      const exact = event("exact", ["Perfective"], "2026-01-01T00:00:00Z");

      expect(kept([maximum, exact], [span])).toStrictEqual([
        "maximum",
        "exact",
      ]);
    });

    it("keeps the moonrise and moonset a Moon Up or Moon Down span starts or ends on", () => {
      const moonUp = event(
        "up",
        ["Moon Up"],
        "2026-01-01T00:00:00Z",
        "2026-01-02T00:00:00Z",
      );
      const moonDown = event(
        "down",
        ["Moon Down"],
        "2026-01-02T00:00:00Z",
        "2026-01-03T00:00:00Z",
      );
      const moonrise = event("moonrise", ["Moonrise"], "2026-01-01T00:00:00Z");
      const moonset = event("moonset", ["Moonset"], "2026-01-02T00:00:00Z");
      const nextMoonrise = event(
        "next moonrise",
        ["Moonrise"],
        "2026-01-03T00:00:00Z",
      );

      expect(
        kept([moonrise, moonset, nextMoonrise], [moonUp, moonDown]),
      ).toStrictEqual(["moonrise", "moonset", "next moonrise"]);
    });

    it("keeps a forming instant on a span's end and an eclipse beginning on its end, since each sits on one edge only", () => {
      const span = event(
        "span",
        ["Simple Aspect", "Eclipse"],
        "2026-01-01T00:00:00Z",
        "2026-01-02T00:00:00Z",
      );
      const forming = event("forming", ["Forming"], "2026-01-02T00:00:00Z");
      const dissolving = event(
        "dissolving",
        ["Dissolving"],
        "2026-01-01T00:00:00Z",
      );
      const beginning = event(
        "beginning",
        ["Beginning"],
        "2026-01-02T00:00:00Z",
      );

      expect(kept([forming, dissolving, beginning], [span])).toStrictEqual([
        "forming",
        "dissolving",
        "beginning",
      ]);
    });

    it("never drops a span, and ignores a span of no duration as an edge", () => {
      const span = event(
        "span",
        ["Ingress"],
        "2026-01-01T00:00:00Z",
        "2026-01-02T00:00:00Z",
      );
      const emptySpan = event("empty", ["Ingress"], "2026-01-09T00:00:00Z");
      const instant = event("instant", ["Ingress"], "2026-01-09T00:00:00Z");

      expect(kept([span, instant], [emptySpan])).toStrictEqual([
        "span",
        "instant",
      ]);
    });

    it("names every family once", () => {
      const names = SPAN_BOUNDARY_RULES.map((rule) => rule.name);

      expect(new Set(names).size).toBe(names.length);
    });
  });
});
