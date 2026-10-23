import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { AspectGraphService } from "../aspects/aspect-graph.service";
import { AspectPhaseEmojiService } from "../aspects/aspect-phase-emoji.service";
import { CompoundPhaseService } from "../aspects/compound-phase.service";
import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import { TripleAspectsComposerService } from "./triple-aspects-composer.service";

import type { AspectBodies } from "../aspects/aspects.types";
import type { DetectedCalendarEvent } from "../database/database.types";

describe(TripleAspectsComposerService, () => {
  let service: TripleAspectsComposerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TripleAspectsComposerService,
        AspectGraphService,
        AspectPhaseEmojiService,
        ProgressiveUtilitiesService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(TripleAspectsComposerService);
    await module.resolve(LoggerService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("aspect helpers", () => {
    it("finds bodies with a specific aspect", () => {
      const edges: AspectBodies[] = [
        { aspect: "conjunct", bodies: ["sun", "moon"] },
        { aspect: "trine", bodies: ["sun", "mars"] },
        { aspect: "trine", bodies: ["jupiter", "sun"] },
      ];

      const bodiesWithTrine = service.findBodiesWithAspectTo(
        "sun",
        "trine",
        edges,
      );

      expect(bodiesWithTrine).toContain("mars");
      expect(bodiesWithTrine).toContain("jupiter");
    });

    it("checks whether two bodies have an aspect", () => {
      const edges: AspectBodies[] = [
        { aspect: "conjunct", bodies: ["sun", "moon"] },
      ];

      expect(
        service.haveAspect({
          aspectType: "conjunct",
          body1: "sun",
          body2: "moon",
          edges,
        }),
      ).toBe(true);

      expect(
        service.haveAspect({
          aspectType: "trine",
          body1: "sun",
          body2: "moon",
          edges,
        }),
      ).toBe(false);
    });
  });

  describe("event composition", () => {
    it("builds a T-Square forming event", () => {
      const minute = moment.utc("2024-03-21T12:00:00.000Z");

      const event = service.buildTripleAspectEvent({
        body1: "sun",
        body2: "moon",
        body3: "mars",
        focalOrApexBody: "mars",
        phase: "forming",
        timestamp: minute,
        tripleAspect: "t-square",
      });

      expect(event.tags).toContain("Triple Aspect");
      expect(event.tags).toContain("T Square");
      expect(event.tags).toContain("Forming");
      expect(event.tags).toContain("Mars Focal");
      expect(event.start).toStrictEqual(minute);
    });

    it("pairs forming and dissolving events into one progressive event", () => {
      const forming: DetectedCalendarEvent = {
        description: "Mars, Moon, Sun t-square forming (Mars focal)",
        end: moment.utc("2024-03-21T10:00:00.000Z"),
        start: moment.utc("2024-03-21T10:00:00.000Z"),
        summary: "T-Square forming",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "T Square",
          "Forming",
          "Sun",
          "Moon",
          "Mars",
          "Mars Focal",
        ],
      };

      const dissolving: DetectedCalendarEvent = {
        description: "Mars, Moon, Sun t-square dissolving (Mars focal)",
        end: moment.utc("2024-03-21T14:00:00.000Z"),
        start: moment.utc("2024-03-21T14:00:00.000Z"),
        summary: "T-Square dissolving",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "T Square",
          "Dissolving",
          "Sun",
          "Moon",
          "Mars",
          "Mars Focal",
        ],
      };

      const progressiveEvents = service.pairProgressiveGroup([
        forming,
        dissolving,
      ]);

      expect(progressiveEvents).toHaveLength(1);
      expect(progressiveEvents[0]?.description).toContain("t-square");
      expect(progressiveEvents[0]?.tags).toContain("Triple Aspect");
      expect(progressiveEvents[0]?.tags).not.toContain("Forming");
      expect(progressiveEvents[0]?.tags).not.toContain("Dissolving");
    });
  });

  describe("empty progressive group", () => {
    it("pairs nothing when the group has no events", () => {
      expect(service.pairProgressiveGroup([])).toStrictEqual([]);
    });
  });

  describe("progressive helpers", () => {
    it("derives progressive keys and phases", () => {
      const minute = moment.utc("2024-03-21T12:00:00.000Z");
      const forming = {
        description: "Moon, Sun, Mars grand trine forming",
        end: minute,
        start: minute,
        summary: "➡️✶ Moon-Sun-Mars Moon, Sun, Mars grand trine forming",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "Grand Trine",
          "Forming",
          "Moon",
          "Sun",
          "Mars",
          "Mars Focal",
        ],
      } as DetectedCalendarEvent;
      const dissolving = {
        ...forming,
        description: "Moon, Sun, Mars grand trine dissolving",
        end: minute.clone().add(1, "hour"),
        start: minute.clone().add(1, "hour"),
        summary: "⬅️✶ Moon-Sun-Mars Moon, Sun, Mars grand trine dissolving",
        tags: forming.tags.map((tag) =>
          tag === "Forming" ? "Dissolving" : tag,
        ),
      };
      const compoundPhaseService = new CompoundPhaseService();

      expect(
        compoundPhaseService.determineCompoundPhaseFromSnapshots({
          checkPatternExists: (edges) => edges.length > 0,
          currentAspectBodies: [{ aspect: "trine", bodies: ["moon", "sun"] }],
          currentMinute: minute,
          patternBodies: ["moon", "sun", "mars"],
          previousAspectBodies: [],
        }),
      ).toStrictEqual({ eventMinute: minute, phase: "forming" });

      expect(
        compoundPhaseService.determineCompoundPhaseFromSnapshots({
          checkPatternExists: (edges) => edges.length > 0,
          currentAspectBodies: [],
          currentMinute: minute,
          patternBodies: ["moon", "sun", "mars"],
          previousAspectBodies: [{ aspect: "trine", bodies: ["moon", "sun"] }],
        })?.phase,
      ).toBe("dissolving");

      expect(
        compoundPhaseService.determineCompoundPhaseFromSnapshots({
          checkPatternExists: (edges) => edges.length > 0,
          currentAspectBodies: [{ aspect: "trine", bodies: ["moon", "sun"] }],
          currentMinute: minute,
          patternBodies: ["moon", "sun", "mars"],
          previousAspectBodies: [{ aspect: "trine", bodies: ["moon", "sun"] }],
        }),
      ).toBeNull();

      expect(service.getProgressiveGroupKey(forming)).toBe(
        "Mars-Moon-Sun-Grand Trine",
      );
      expect(
        service.getProgressiveGroupKey({ ...forming, tags: ["Moon"] }),
      ).toBe("");

      expect(service.pairProgressiveGroup([forming, dissolving])).toHaveLength(
        1,
      );
      expect(
        service.pairProgressiveGroup([
          { ...forming, end: minute, start: minute },
          { ...dissolving, start: minute },
        ]),
      ).toHaveLength(0);

      expect(
        service.buildProgressiveEvent({
          aspectCapitalized: "Mystery Aspect",
          dissolving,
          forming,
        }),
      ).toBeNull();

      expect(
        service.buildProgressiveEvent({
          aspectCapitalized: "Grand Trine",
          dissolving,
          forming: {
            ...forming,
            tags: forming.tags.map((tag) => (tag === "Mars" ? "Eris" : tag)),
          },
        }),
      ).toBeNull();

      const yodProgressiveEvent = service.buildProgressiveEvent({
        aspectCapitalized: "Yod",
        dissolving,
        forming: {
          ...forming,
          tags: forming.tags.map((tag) =>
            tag === "Mars Focal" ? "Mars Focal" : tag,
          ),
        },
      });

      expect(yodProgressiveEvent?.summary).toContain("(apex: Mars)");

      expect(
        service.buildProgressiveEvent({
          aspectCapitalized: "Grand Trine",
          dissolving,
          forming: {
            ...forming,
            tags: ["Astronomy", "Astrology", "Compound Aspect"],
          },
        }),
      ).toBeNull();
    });

    it("returns the dissolving phase emoji", () => {
      const internals = service as unknown as {
        getPhaseEmoji: (phase: string) => string;
      };

      expect(internals.getPhaseEmoji("dissolving")).toBe("⬅️");
    });

    it("returns the perfective phase emoji", () => {
      const internals = service as unknown as {
        getPhaseEmoji: (phase: string) => string;
      };

      expect(internals.getPhaseEmoji("perfective")).toBe("🎯");
    });

    it("skips progressive pairs without a recognized aspect label", () => {
      const minute = moment.utc("2024-03-21T12:00:00.000Z");
      const forming = {
        description: "Sun, Moon, Mars forming",
        end: minute,
        start: minute,
        summary: "⬅️ Sun-Moon-Mars",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "Forming",
          "Sun",
          "Moon",
          "Mars",
        ],
      } as DetectedCalendarEvent;
      const dissolving = {
        ...forming,
        description: "Sun, Moon, Mars dissolving",
        end: minute.clone().add(1, "hour"),
        start: minute.clone().add(1, "hour"),
        summary: "⬅️ Sun-Moon-Mars",
        tags: forming.tags.map((tag) =>
          tag === "Forming" ? "Dissolving" : tag,
        ),
      };

      expect(service.pairProgressiveGroup([forming, dissolving])).toHaveLength(
        0,
      );
    });

    it("leaves a lone boundary unpaired and rejects unknown labels", () => {
      const internals = service as unknown as {
        resolveAspectType: (aspectCapitalized: string) => null;
        resolveProgressiveMeta: (
          bodiesCapitalized: string[],
          aspect: "grand trine" | "t-square" | "yod",
        ) => null;
      };
      const minute = moment.utc("2024-03-21T12:00:00.000Z");
      const forming = {
        description: "Sun, Moon, Mars grand trine forming",
        end: minute,
        start: minute,
        summary: "➡️✶ Sun-Moon-Mars",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "Grand Trine",
          "Forming",
          "Sun",
          "Moon",
          "Mars",
        ],
      } as DetectedCalendarEvent;
      const dissolving = {
        ...forming,
        description: "Sun, Moon, Mars grand trine dissolving",
        end: minute.clone().add(1, "hour"),
        start: minute.clone().add(1, "hour"),
        summary: "⬅️✶ Sun-Moon-Mars",
        tags: forming.tags.map((tag) =>
          tag === "Forming" ? "Dissolving" : tag,
        ),
      };

      expect(service.pairProgressiveGroup([dissolving])).toHaveLength(0);
      expect(service.pairProgressiveGroup([forming])).toHaveLength(0);
      expect(internals.resolveAspectType("Mystery Aspect")).toBeNull();
      expect(
        internals.resolveProgressiveMeta(["Sun", "Moon", "Eris"], "yod"),
      ).toBeNull();
    });

    it("builds no span when the only dissolving precedes the forming", () => {
      const minute = moment.utc("2024-03-21T12:00:00.000Z");
      const laterForming = {
        description: "Sun, Moon, Mars grand trine forming",
        end: minute.clone().add(1, "hour"),
        start: minute.clone().add(1, "hour"),
        summary: "➡️✶ Sun-Moon-Mars",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "Grand Trine",
          "Forming",
          "Sun",
          "Moon",
          "Mars",
        ],
      } as DetectedCalendarEvent;
      const earlierDissolving = {
        ...laterForming,
        description: "Sun, Moon, Mars grand trine dissolving",
        end: minute,
        start: minute,
        summary: "⬅️✶ Sun-Moon-Mars",
        tags: laterForming.tags.map((tag) =>
          tag === "Forming" ? "Dissolving" : tag,
        ),
      };

      expect(
        service.pairProgressiveGroup([laterForming, earlierDissolving]),
      ).toHaveLength(0);
    });

    it("returns null when progressive bodies are incomplete", () => {
      const internals = service as unknown as {
        resolveProgressiveMeta: (
          bodiesCapitalized: string[],
          aspect: "grand trine" | "t-square" | "yod",
        ) => null;
      };

      expect(
        internals.resolveProgressiveMeta(["Sun", "Moon"], "yod"),
      ).toBeNull();
    });

    it("adds focal metadata for t-square progressive summaries", () => {
      const minute = moment.utc("2024-03-21T12:00:00.000Z");
      const forming = {
        description: "Mars, Moon, Sun t-square forming (Mars focal)",
        end: minute,
        start: minute,
        summary: "➡️⊤☀️-🌙-♂️ Mars, Moon, Sun t-square forming (Mars focal)",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "T Square",
          "Forming",
          "Sun",
          "Moon",
          "Mars",
          "Mars Focal",
        ],
      } as DetectedCalendarEvent;
      const dissolving = {
        ...forming,
        description: "Mars, Moon, Sun t-square dissolving (Mars focal)",
        end: minute.clone().add(2, "hours"),
        start: minute.clone().add(2, "hours"),
        summary: "⬅️⊤☀️-🌙-♂️ Mars, Moon, Sun t-square dissolving (Mars focal)",
        tags: forming.tags.map((tag) =>
          tag === "Forming" ? "Dissolving" : tag,
        ),
      };

      const progressiveEvent = service.buildProgressiveEvent({
        aspectCapitalized: "T Square",
        dissolving,
        forming,
      });

      expect(progressiveEvent?.description).toBe("Mars, Moon, Sun t-square");
      expect(progressiveEvent?.summary).toContain("(focal: Mars)");
    });

    it("builds progressive spans for asteroids and lunar points", () => {
      const minute = moment.utc("2026-10-01T12:00:00.000Z");
      const forming = {
        description: "Juno, Lunar Apogee, North Lunar Node grand trine forming",
        end: minute,
        start: minute,
        summary: "",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "Grand Trine",
          "Forming",
          "Juno",
          "Lunar Apogee",
          "North Lunar Node",
        ],
      } as DetectedCalendarEvent;
      const dissolving = {
        ...forming,
        end: minute.clone().add(2, "hours"),
        start: minute.clone().add(2, "hours"),
      };

      const progressiveEvent = service.buildProgressiveEvent({
        aspectCapitalized: "Grand Trine",
        dissolving,
        forming,
      });

      expect(progressiveEvent?.description).toBe(
        "Juno, Lunar Apogee, North Lunar Node grand trine",
      );
    });

    it("skips push when a progressive pair resolves to null", () => {
      const minute = moment.utc("2024-03-21T12:00:00.000Z");
      const forming = {
        description: "Sun, Moon, Mars grand trine forming",
        end: minute,
        start: minute,
        summary: "➡️✶ Sun-Moon-Mars",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "Grand Trine",
          "Forming",
          "Sun",
          "Moon",
          "Mars",
        ],
      } as DetectedCalendarEvent;
      const dissolving = {
        ...forming,
        description: "Sun, Moon, Mars grand trine dissolving",
        end: minute.clone().add(1, "hour"),
        start: minute.clone().add(1, "hour"),
        summary: "⬅️✶ Sun-Moon-Mars",
        tags: forming.tags.map((tag) =>
          tag === "Forming" ? "Dissolving" : tag,
        ),
      };

      const buildProgressiveEventSpy = vi
        .spyOn(service, "buildProgressiveEvent")
        .mockReturnValueOnce(null);

      const results = service.pairProgressiveGroup([forming, dissolving]);

      expect(results).toStrictEqual([]);
      expect(buildProgressiveEventSpy).toHaveBeenCalledTimes(1);

      buildProgressiveEventSpy.mockRestore();
    });

    it("returns null when progressive body labels are fully absent", () => {
      const internals = service as unknown as {
        resolveProgressiveMeta: (
          bodiesCapitalized: string[],
          aspect: "grand trine" | "t-square" | "yod",
        ) => null;
      };

      expect(internals.resolveProgressiveMeta([], "grand trine")).toBeNull();
    });

    it("sorts multiple forming and dissolving events before pair resolution", () => {
      const minute = moment.utc("2024-03-21T12:00:00.000Z");
      const formingLater = {
        description: "later forming",
        end: minute.clone().add(2, "hours"),
        start: minute.clone().add(2, "hours"),
        summary: "later forming",
        tags: [
          "Astronomy",
          "Astrology",
          "Compound Aspect",
          "Triple Aspect",
          "Grand Trine",
          "Forming",
          "Sun",
          "Moon",
          "Mars",
        ],
      } as DetectedCalendarEvent;
      const formingEarlier = {
        ...formingLater,
        description: "earlier forming",
        end: minute,
        start: minute,
        summary: "earlier forming",
      };
      const dissolvingLater = {
        ...formingLater,
        description: "later dissolving",
        end: minute.clone().add(4, "hours"),
        start: minute.clone().add(4, "hours"),
        summary: "later dissolving",
        tags: formingLater.tags.map((tag) =>
          tag === "Forming" ? "Dissolving" : tag,
        ),
      };
      const dissolvingEarlier = {
        ...dissolvingLater,
        description: "earlier dissolving",
        end: minute.clone().add(1, "hour"),
        start: minute.clone().add(1, "hour"),
        summary: "earlier dissolving",
      };

      const spans = service
        .pairProgressiveGroup([
          formingLater,
          dissolvingLater,
          formingEarlier,
          dissolvingEarlier,
        ])
        .map((span) => [span.start.toISOString(), span.end.toISOString()]);

      expect(spans).toStrictEqual([
        [
          formingEarlier.start.toISOString(),
          dissolvingEarlier.start.toISOString(),
        ],
        [formingLater.start.toISOString(), dissolvingLater.start.toISOString()],
      ]);
    });
  });
});
