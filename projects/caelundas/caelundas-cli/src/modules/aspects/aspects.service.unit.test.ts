import { createMock } from "@golevelup/ts-vitest";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { EphemerisModule } from "../ephemeris/ephemeris.module";
import { BoundarySearchService } from "../ephemeris/modules/boundary-search/boundary-search.service";
import { MathService } from "../ephemeris/modules/math/math.service";
import { ProgressiveAspectService } from "../progressive/progressive-aspect.service";
import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import {
  COMPOSITE_ASPECT_DETECTORS_TOKEN,
  PROGRESSIVE_ASPECT_DETECTORS_TOKEN,
  SIMPLE_ASPECT_DETECTORS_TOKEN,
} from "./aspects.constants";
import { AspectsService } from "./aspects.service";
import { AspectEdgesService } from "./modules/calculation/aspect-edges.service";
import { AspectEphemerisService } from "./modules/calculation/aspect-ephemeris.service";
import { AspectGraphService } from "./modules/calculation/aspect-graph.service";
import { CompoundPhaseService } from "./modules/compound-phases/compound-phase.service";
import { ProgressiveCompoundEventService } from "./modules/compound-phases/progressive-compound-event.service";
import { AspectEventFormattingService } from "./modules/formatting/aspect-event-formatting.service";
import { AspectPhaseEmojiService } from "./modules/formatting/aspect-phase-emoji.service";
import { MajorAspectEventService } from "./modules/major-aspects/major-aspect-event.service";
import { MajorAspectProgressiveService } from "./modules/major-aspects/major-aspect-progressive.service";
import { MajorAspectsService } from "./modules/major-aspects/major-aspects.service";
import { MinorAspectsComposerService } from "./modules/minor-aspects/minor-aspects-composer.service";
import { MinorAspectsEventService } from "./modules/minor-aspects/minor-aspects-event.service";
import { MinorAspectsProgressiveService } from "./modules/minor-aspects/minor-aspects-progressive.service";
import { MinorAspectsService } from "./modules/minor-aspects/minor-aspects.service";
import { QuadrupleAspectsBaseService } from "./modules/quadruple-aspects/quadruple-aspects-base.service";
import { QuadrupleAspectsComposerService } from "./modules/quadruple-aspects/quadruple-aspects-composer.service";
import { QuadrupleAspectsService } from "./modules/quadruple-aspects/quadruple-aspects.service";
import { QuintupleAspectsComposerService } from "./modules/quintuple-aspects/quintuple-aspects-composer.service";
import { QuintupleAspectsService } from "./modules/quintuple-aspects/quintuple-aspects.service";
import { SextupleAspectsComposerService } from "./modules/sextuple-aspects/sextuple-aspects-composer.service";
import { SextupleAspectsService } from "./modules/sextuple-aspects/sextuple-aspects.service";
import { SpecialtyAspectsComposerService } from "./modules/specialty-aspects/specialty-aspects-composer.service";
import { SpecialtyAspectsEventService } from "./modules/specialty-aspects/specialty-aspects-event.service";
import { SpecialtyAspectsProgressiveService } from "./modules/specialty-aspects/specialty-aspects-progressive.service";
import { SpecialtyAspectsService } from "./modules/specialty-aspects/specialty-aspects.service";
import { StelliumService } from "./modules/stellium/stellium.service";
import { TripleAspectsComposerService } from "./modules/triple-aspects/triple-aspects-composer.service";
import { TripleAspectsDetectorService } from "./modules/triple-aspects/triple-aspects-detector.service";
import { TripleAspectsService } from "./modules/triple-aspects/triple-aspects.service";
import { AspectsUtilitiesService } from "./modules/utilities/aspects-utilities.service";

import type { Body } from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { CoordinateEphemeris } from "../ephemeris/ephemeris.types";
import type {
  AspectBodies,
  CompositeAspectDetector,
  ProgressiveAspectDetector,
  SimpleAspectDetector,
} from "./aspects.types";

describe(AspectsService, () => {
  let service: AspectsService;

  const testingModuleOptions = {
    imports: [EphemerisModule],
    providers: [
      AspectEdgesService,
      AspectsUtilitiesService,
      BoundarySearchService,
      AspectEphemerisService,
      AspectEventFormattingService,
      AspectGraphService,
      AspectPhaseEmojiService,
      CompoundPhaseService,
      MajorAspectsService,
      MajorAspectEventService,
      MajorAspectProgressiveService,
      MathService,
      MinorAspectsService,
      MinorAspectsComposerService,
      MinorAspectsEventService,
      MinorAspectsProgressiveService,
      ProgressiveCompoundEventService,
      ProgressiveAspectService,
      ProgressiveUtilitiesService,
      QuadrupleAspectsService,
      QuadrupleAspectsBaseService,
      QuadrupleAspectsComposerService,
      QuintupleAspectsService,
      QuintupleAspectsComposerService,
      SextupleAspectsService,
      SextupleAspectsComposerService,
      SpecialtyAspectsService,
      SpecialtyAspectsComposerService,
      SpecialtyAspectsEventService,
      SpecialtyAspectsProgressiveService,
      StelliumService,
      TripleAspectsService,
      TripleAspectsComposerService,
      TripleAspectsDetectorService,
      {
        inject: [
          MajorAspectsService,
          MinorAspectsService,
          SpecialtyAspectsService,
        ],
        provide: SIMPLE_ASPECT_DETECTORS_TOKEN,
        useFactory: (
          majorAspectsService: MajorAspectsService,
          minorAspectsService: MinorAspectsService,
          specialtyAspectsService: SpecialtyAspectsService,
        ) => [
          majorAspectsService,
          minorAspectsService,
          specialtyAspectsService,
        ],
      },
      {
        inject: [
          TripleAspectsService,
          QuadrupleAspectsService,
          QuintupleAspectsService,
          SextupleAspectsService,
          StelliumService,
        ],
        provide: COMPOSITE_ASPECT_DETECTORS_TOKEN,
        useFactory: (
          tripleAspectsService: TripleAspectsService,
          quadrupleAspectsService: QuadrupleAspectsService,
          quintupleAspectsService: QuintupleAspectsService,
          sextupleAspectsService: SextupleAspectsService,
          stelliumService: StelliumService,
        ) => [
          tripleAspectsService,
          quadrupleAspectsService,
          quintupleAspectsService,
          sextupleAspectsService,
          stelliumService,
        ],
      },
      {
        inject: [
          MajorAspectsService,
          MinorAspectsService,
          SpecialtyAspectsService,
          TripleAspectsService,
          QuadrupleAspectsService,
          QuintupleAspectsService,
          SextupleAspectsService,
          StelliumService,
        ],
        provide: PROGRESSIVE_ASPECT_DETECTORS_TOKEN,
        useFactory: (
          majorAspectsService: MajorAspectsService,
          minorAspectsService: MinorAspectsService,
          specialtyAspectsService: SpecialtyAspectsService,
          tripleAspectsService: TripleAspectsService,
          quadrupleAspectsService: QuadrupleAspectsService,
          quintupleAspectsService: QuintupleAspectsService,
          sextupleAspectsService: SextupleAspectsService,
          stelliumService: StelliumService,
        ) => [
          majorAspectsService,
          minorAspectsService,
          specialtyAspectsService,
          tripleAspectsService,
          quadrupleAspectsService,
          quintupleAspectsService,
          sextupleAspectsService,
          stelliumService,
        ],
      },
    ],
  };

  beforeAll(async () => {
    const { instance } = await buildTestingModule(
      AspectsService,
      testingModuleOptions,
    );

    service = instance;
  });

  describe("computeAspectBodies", () => {
    const timestamp = moment.utc("2026-01-21T12:00:00Z");

    function createAspectEvent(args: {
      aspectType: string;
      body1: string;
      body2: string;
      phase: "Dissolving" | "Forming" | "Perfective";
    }): DetectedCalendarEvent {
      return {
        description: "",
        end: timestamp,
        start: timestamp,
        summary: `${args.body1} ${args.phase.toLowerCase()} ${args.aspectType} ${args.body2}`,
        tags: [
          "Astronomy",
          "Astrology",
          "Simple Aspect",
          "Major Aspect",
          args.body1,
          args.body2,
          args.aspectType,
          args.phase,
        ],
      };
    }

    it("returns empty array when given no previous state and no events", () => {
      expect(service.computeAspectBodies([], [])).toStrictEqual([]);
    });

    it("adds an aspect on forming and ignores perfective", () => {
      const result = service.computeAspectBodies(
        [],
        [
          createAspectEvent({
            aspectType: "Conjunct",
            body1: "Sun",
            body2: "Moon",
            phase: "Forming",
          }),
          createAspectEvent({
            aspectType: "Conjunct",
            body1: "Sun",
            body2: "Moon",
            phase: "Perfective",
          }),
        ],
      );

      expect(result).toStrictEqual([
        {
          aspect: "conjunct",
          bodies: ["sun", "moon"],
        },
      ]);
    });

    it("removes an aspect on dissolving", () => {
      const afterForming = service.computeAspectBodies(
        [],
        [
          createAspectEvent({
            aspectType: "Conjunct",
            body1: "Sun",
            body2: "Moon",
            phase: "Forming",
          }),
        ],
      );

      const result = service.computeAspectBodies(afterForming, [
        createAspectEvent({
          aspectType: "Conjunct",
          body1: "Sun",
          body2: "Moon",
          phase: "Dissolving",
        }),
      ]);

      expect(result).toStrictEqual([]);
    });

    it("uses canonical key regardless of body order", () => {
      const afterForming = service.computeAspectBodies(
        [],
        [
          createAspectEvent({
            aspectType: "Conjunct",
            body1: "Moon",
            body2: "Sun",
            phase: "Forming",
          }),
        ],
      );

      const result = service.computeAspectBodies(afterForming, [
        createAspectEvent({
          aspectType: "Conjunct",
          body1: "Sun",
          body2: "Moon",
          phase: "Dissolving",
        }),
      ]);

      expect(result).toStrictEqual([]);
    });

    it("tracks different aspect types for the same pair", () => {
      const result = service.computeAspectBodies(
        [],
        [
          createAspectEvent({
            aspectType: "Conjunct",
            body1: "Sun",
            body2: "Moon",
            phase: "Forming",
          }),
          createAspectEvent({
            aspectType: "Sextile",
            body1: "Sun",
            body2: "Moon",
            phase: "Forming",
          }),
        ],
      );

      expect(result).toHaveLength(2);
      expect(result).toStrictEqual(
        expect.arrayContaining([
          { aspect: "conjunct", bodies: ["sun", "moon"] },
          { aspect: "sextile", bodies: ["sun", "moon"] },
        ]),
      );
    });

    it("skips non-simple-aspect events", () => {
      const result = service.computeAspectBodies(
        [],
        [
          {
            description: "",
            end: timestamp,
            start: timestamp,
            summary: "Moon enters Aries",
            tags: ["Astronomy", "Ingress", "Moon", "Aries"],
          },
        ],
      );

      expect(result).toStrictEqual([]);
    });

    it("skips simple-aspect events without forming or dissolving phase", () => {
      const result = service.computeAspectBodies(
        [],
        [
          {
            description: "",
            end: timestamp,
            start: timestamp,
            summary: "Sun conjunct Moon",
            tags: [
              "Astronomy",
              "Astrology",
              "Simple Aspect",
              "Major Aspect",
              "Sun",
              "Moon",
              "Conjunct",
            ],
          },
        ],
      );

      expect(result).toStrictEqual([]);
    });

    it("skips simple-aspect events with invalid aspect names", () => {
      const result = service.computeAspectBodies(
        [],
        [
          {
            description: "",
            end: timestamp,
            start: timestamp,
            summary: "Invalid",
            tags: [
              "Astronomy",
              "Astrology",
              "Simple Aspect",
              "Major Aspect",
              "Sun",
              "Moon",
              "NotAnAspect",
              "Forming",
            ],
          },
        ],
      );

      expect(result).toStrictEqual([]);
    });

    it("skips simple-aspect events that do not include exactly two bodies", () => {
      const result = service.computeAspectBodies(
        [],
        [
          {
            description: "",
            end: timestamp,
            start: timestamp,
            summary: "Invalid body count",
            tags: [
              "Astronomy",
              "Astrology",
              "Simple Aspect",
              "Major Aspect",
              "Sun",
              "Conjunct",
              "Forming",
            ],
          },
        ],
      );

      expect(result).toStrictEqual([]);
    });

    it("does not duplicate an already-active forming aspect", () => {
      const result = service.computeAspectBodies(
        [{ aspect: "conjunct", bodies: ["sun", "moon"] }],
        [
          createAspectEvent({
            aspectType: "Conjunct",
            body1: "Sun",
            body2: "Moon",
            phase: "Forming",
          }),
        ],
      );

      expect(result).toStrictEqual([
        { aspect: "conjunct", bodies: ["sun", "moon"] },
      ]);
    });

    it("does not mutate the previous state array", () => {
      const afterForming = service.computeAspectBodies(
        [],
        [
          createAspectEvent({
            aspectType: "Conjunct",
            body1: "Sun",
            body2: "Moon",
            phase: "Forming",
          }),
        ],
      );

      service.computeAspectBodies(afterForming, [
        createAspectEvent({
          aspectType: "Conjunct",
          body1: "Sun",
          body2: "Moon",
          phase: "Dissolving",
        }),
      ]);

      expect(afterForming).toHaveLength(1);
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      AspectsService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(AspectsService);
  });

  describe("detect", () => {
    it("emits a compound aspect once when detectors repeat it", () => {
      const minute = moment.utc("2026-10-20T12:00:00Z");
      const kite = (order: string[]): DetectedCalendarEvent => ({
        description: "Jupiter, Mars, Moon, Venus kite forming (Venus focal)",
        end: minute,
        start: minute,
        summary: ` 🪁 ${order.join("-")} kite forming`,
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Quadruple Aspect",
          "Kite",
          "Forming",
          ...order,
          "Venus Focal",
        ],
      });
      const repeatingDetector = {
        detect: vi
          .fn<CompositeAspectDetector["detect"]>()
          .mockReturnValue([
            kite(["Moon", "Mars", "Jupiter", "Venus"]),
            kite(["Moon", "Jupiter", "Mars", "Venus"]),
          ]),
      };
      const delegatedService = new AspectsService(
        [],
        [repeatingDetector, repeatingDetector],
        [],
        createMock<AspectEdgesService>(),
        new LoggerService(),
      );

      const { events } = delegatedService.detect({
        coordinateEphemerisByBody: {} as Record<Body, CoordinateEphemeris>,
        minute,
        previousAspectBodies: [],
      });

      expect(events).toStrictEqual([
        kite(["Moon", "Mars", "Jupiter", "Venus"]),
      ]);
    });

    it("combines detector outputs and progressive events", () => {
      const minute = moment.utc("2026-01-21T12:00:00Z");
      const simpleEvent = {
        description: "Sun forming conjunct Moon",
        end: minute,
        start: minute,
        summary: "Sun forming conjunct Moon",
        tags: [
          "Astronomy",
          "Astrology",
          "Simple Aspect",
          "Major Aspect",
          "Sun",
          "Moon",
          "Conjunct",
          "Forming",
        ],
      } satisfies DetectedCalendarEvent;
      const compositeEvent = {
        description: "Composite",
        end: minute,
        start: minute,
        summary: "Composite",
        tags: ["Astronomy", "Astrology", "Composite"],
      } satisfies DetectedCalendarEvent;
      const progressiveEvent = {
        description: "Progressive",
        end: minute,
        start: minute,
        summary: "Progressive",
        tags: ["Astronomy", "Astrology", "Progressive"],
      } satisfies DetectedCalendarEvent;

      const mockSimpleAspectDetector = {
        detect: vi
          .fn<SimpleAspectDetector["detect"]>()
          .mockReturnValue([simpleEvent]),
        detectActive: vi.fn<SimpleAspectDetector["detectActive"]>(),
      };
      const mockCompositeAspectDetector = {
        detect: vi
          .fn<CompositeAspectDetector["detect"]>()
          .mockReturnValue([compositeEvent]),
      };
      const mockProgressiveAspectDetector = {
        detectProgressive: vi
          .fn<ProgressiveAspectDetector["detectProgressive"]>()
          .mockReturnValue([progressiveEvent]),
      };
      const delegatedService = new AspectsService(
        [mockSimpleAspectDetector],
        [mockCompositeAspectDetector],
        [mockProgressiveAspectDetector],
        createMock<AspectEdgesService>(),
        new LoggerService(),
      );
      const coordinateEphemerisByBody = {} as Record<Body, CoordinateEphemeris>;

      const detectResult = delegatedService.detect({
        coordinateEphemerisByBody,
        minute,
        previousAspectBodies: [],
      });

      expect(mockSimpleAspectDetector.detect).toHaveBeenCalledWith({
        coordinateEphemerisByBody,
        minute,
      });
      expect(mockCompositeAspectDetector.detect).toHaveBeenCalledWith({
        currentAspectBodies: [{ aspect: "conjunct", bodies: ["sun", "moon"] }],
        minute,
        previousAspectBodies: [],
      });
      expect(detectResult.events).toStrictEqual([simpleEvent, compositeEvent]);

      expect(delegatedService.detectProgressive([simpleEvent])).toStrictEqual([
        progressiveEvent,
      ]);
      expect(
        mockProgressiveAspectDetector.detectProgressive,
      ).toHaveBeenCalledWith([simpleEvent]);
    });
  });

  describe("detectProgressive over a sweep window", () => {
    const minute = moment.utc("2026-01-21T12:00:00Z");
    const buildEvent = (summary: string): DetectedCalendarEvent => ({
      description: summary,
      end: minute,
      start: minute,
      summary,
      tags: ["Astronomy", "Astrology"],
    });
    const window = {
      end: moment.utc("2026-01-31T23:59:00Z"),
      start: moment.utc("2026-01-01T00:00:00Z"),
    };

    it("hands the detectors the events the aspect edges add", () => {
      const detected = buildEvent("detected");
      const edge = buildEvent("edge");
      const edges = createMock<AspectEdgesService>();
      edges.complete.mockReturnValue([edge]);
      const detector = {
        detectProgressive: vi
          .fn<ProgressiveAspectDetector["detectProgressive"]>()
          .mockReturnValue([]),
      };
      const edgeService = new AspectsService(
        [],
        [],
        [detector],
        edges,
        new LoggerService(),
      );

      edgeService.detectProgressive([detected], window);

      expect(edges.complete).toHaveBeenCalledWith([detected], window);
      expect(detector.detectProgressive).toHaveBeenCalledWith([detected, edge]);
    });

    describe("compound aspects", () => {
      const boundary = (args: {
        aspect: string;
        bodies: [string, string];
        iso: string;
        phase: "Dissolving" | "Forming";
      }): DetectedCalendarEvent => {
        const date = moment.utc(args.iso);
        return {
          description: args.aspect,
          end: date,
          start: date,
          summary: args.aspect,
          tags: [
            "Astronomy",
            "Astrology",
            "Simple Aspect",
            ...args.bodies,
            args.aspect,
            args.phase,
          ],
        };
      };
      const trine = (
        phase: "Dissolving" | "Forming",
        iso: string,
      ): DetectedCalendarEvent =>
        boundary({ aspect: "Trine", bodies: ["Sun", "Moon"], iso, phase });
      const sextile = (
        phase: "Dissolving" | "Forming",
        iso: string,
      ): DetectedCalendarEvent =>
        boundary({ aspect: "Sextile", bodies: ["Sun", "Mars"], iso, phase });
      /** A compound existing while the trine and sextile hold. */
      const compositeDetector: CompositeAspectDetector = {
        detect: ({ currentAspectBodies, minute, previousAspectBodies }) => {
          const holds = (registry: AspectBodies[]): boolean =>
            ["trine", "sextile"].every((aspect) =>
              registry.some((entry) => entry.aspect === aspect),
            );
          const phase =
            (holds(currentAspectBodies) ? 1 : 0) -
            (holds(previousAspectBodies) ? 1 : 0);

          return phase === 0
            ? []
            : [
                {
                  description: "compound",
                  end: minute,
                  start: minute,
                  summary: "compound",
                  tags: [
                    "Compound Aspect",
                    phase > 0 ? "Forming" : "Dissolving",
                  ],
                },
              ];
        },
      };
      const detectCompounds = (
        inWindow: DetectedCalendarEvent[],
        edge: DetectedCalendarEvent[],
        sweep = window,
      ): [string, string][] => {
        const edges = createMock<AspectEdgesService>();
        edges.complete.mockReturnValue(edge);
        const detector = {
          detectProgressive: vi
            .fn<ProgressiveAspectDetector["detectProgressive"]>()
            .mockReturnValue([]),
        };
        const service = new AspectsService(
          [],
          [compositeDetector],
          [detector],
          edges,
          new LoggerService(),
        );

        service.detectProgressive(inWindow, sweep);

        return (detector.detectProgressive.mock.calls.at(0)?.[0] ?? [])
          .filter((event) => event.tags.includes("Compound Aspect"))
          .map((event) => [event.tags.at(-1) ?? "", event.start.toISOString()]);
      };

      it("starts a compound before the window at the latest forming of its aspects", () => {
        expect(
          detectCompounds(
            [trine("Dissolving", "2026-01-10T00:00:00Z")],
            [
              trine("Forming", "2025-12-20T00:00:00Z"),
              sextile("Forming", "2025-12-28T06:30:00Z"),
              sextile("Dissolving", "2026-02-05T00:00:00Z"),
            ],
          ),
        ).toStrictEqual([["Forming", "2025-12-28T06:30:00.000Z"]]);
      });

      it("ends a compound after the window at the earliest dissolving of its aspects", () => {
        expect(
          detectCompounds(
            [trine("Forming", "2026-01-05T00:00:00Z")],
            [
              sextile("Forming", "2025-12-01T00:00:00Z"),
              sextile("Dissolving", "2026-02-20T00:00:00Z"),
              trine("Dissolving", "2026-02-10T12:00:00Z"),
            ],
          ),
        ).toStrictEqual([["Dissolving", "2026-02-10T12:00:00.000Z"]]);
      });

      it("begins a compound at the range's first minute when its aspects were clipped there", () => {
        const sweep = {
          end: moment.utc("1900-01-31T23:59:00Z"),
          start: moment.utc("1900-01-01T00:00:00Z"),
        };

        expect(
          detectCompounds(
            [trine("Dissolving", "1900-01-10T00:00:00Z")],
            [
              trine("Forming", "1900-01-01T00:00:00Z"),
              sextile("Forming", "1900-01-01T00:00:00Z"),
            ],
            sweep,
          ),
        ).toStrictEqual([["Forming", "1900-01-01T00:00:00.000Z"]]);
      });

      it("ends a compound at the range's last minute when its aspects were clipped there", () => {
        const sweep = {
          end: moment.utc("2100-12-31T23:59:00Z"),
          start: moment.utc("2100-12-01T00:00:00Z"),
        };

        expect(
          detectCompounds(
            [
              trine("Forming", "2100-12-05T00:00:00Z"),
              sextile("Forming", "2100-12-06T00:00:00Z"),
            ],
            [
              trine("Dissolving", "2100-12-31T23:59:00Z"),
              sextile("Dissolving", "2100-12-31T23:59:00Z"),
            ],
            sweep,
          ),
        ).toStrictEqual([["Dissolving", "2100-12-31T23:59:00.000Z"]]);
      });

      it("leaves the compound boundaries inside the window to the sweep", () => {
        expect(
          detectCompounds(
            [
              trine("Forming", "2026-01-05T00:00:00Z"),
              sextile("Forming", "2026-01-06T00:00:00Z"),
              trine("Dissolving", "2026-01-20T00:00:00Z"),
            ],
            [],
          ),
        ).toStrictEqual([]);
      });
    });

    it("adds no edges without a window", () => {
      const detected = buildEvent("detected");
      const edges = createMock<AspectEdgesService>();
      const detector = {
        detectProgressive: vi
          .fn<ProgressiveAspectDetector["detectProgressive"]>()
          .mockReturnValue([]),
      };
      const plainService = new AspectsService(
        [],
        [],
        [detector],
        edges,
        new LoggerService(),
      );

      plainService.detectProgressive([detected]);

      expect(edges.complete).not.toHaveBeenCalled();
      expect(detector.detectProgressive).toHaveBeenCalledWith([detected]);
    });
  });

  describe("seed", () => {
    it("returns every aspect already in orb and detects no compound at the start", () => {
      const minute = moment.utc("2026-10-01T04:00:00Z");
      const compositeEvent = {
        description: "T-Square",
        end: minute,
        start: minute,
        summary: "T-Square",
        tags: ["Astronomy", "Astrology", "Compound Aspect", "Forming"],
      } satisfies DetectedCalendarEvent;
      const majorActive = [
        { aspect: "opposite", bodies: ["mars", "pluto"] },
        { aspect: "square", bodies: ["mercury", "mars"] },
      ] satisfies AspectBodies[];
      const minorActive = [
        { aspect: "quincunx", bodies: ["sun", "neptune"] },
      ] satisfies AspectBodies[];
      const mockMajorDetector = {
        detect: vi.fn<SimpleAspectDetector["detect"]>(),
        detectActive: vi
          .fn<SimpleAspectDetector["detectActive"]>()
          .mockReturnValue(majorActive),
      };
      const mockMinorDetector = {
        detect: vi.fn<SimpleAspectDetector["detect"]>(),
        detectActive: vi
          .fn<SimpleAspectDetector["detectActive"]>()
          .mockReturnValue(minorActive),
      };
      const mockCompositeAspectDetector = {
        detect: vi
          .fn<CompositeAspectDetector["detect"]>()
          .mockReturnValue([compositeEvent]),
      };
      const seedingService = new AspectsService(
        [mockMajorDetector, mockMinorDetector],
        [mockCompositeAspectDetector],
        [],
        createMock<AspectEdgesService>(),
        new LoggerService(),
      );
      const coordinateEphemerisByBody = {} as Record<Body, CoordinateEphemeris>;

      const seeded = seedingService.seed({ coordinateEphemerisByBody, minute });

      expect(mockMajorDetector.detectActive).toHaveBeenCalledWith({
        coordinateEphemerisByBody,
        minute,
      });
      expect(seeded).toStrictEqual([...majorActive, ...minorActive]);
      expect(mockCompositeAspectDetector.detect).not.toHaveBeenCalled();
    });

    it("emits no simple-aspect events", () => {
      const minute = moment.utc("2026-10-01T04:00:00Z");
      const mockSimpleAspectDetector = {
        detect: vi.fn<SimpleAspectDetector["detect"]>(),
        detectActive: vi
          .fn<SimpleAspectDetector["detectActive"]>()
          .mockReturnValue([{ aspect: "trine", bodies: ["sun", "moon"] }]),
      };
      const seedingService = new AspectsService(
        [mockSimpleAspectDetector],
        [],
        [],
        createMock<AspectEdgesService>(),
        new LoggerService(),
      );

      const seeded = seedingService.seed({
        coordinateEphemerisByBody: {} as Record<Body, CoordinateEphemeris>,
        minute,
      });

      expect(mockSimpleAspectDetector.detect).not.toHaveBeenCalled();
      expect(seeded).toStrictEqual([
        { aspect: "trine", bodies: ["sun", "moon"] },
      ]);
    });
  });
});
