import { Inject, Injectable } from "@nestjs/common";

import { AspectsService } from "../aspects/aspects.service";
import { withEdgeEvents } from "../ephemeris/modules/boundary-search/boundary-search.utilities";
import { AnnualSolarCycleService } from "../perfective/modules/annual-solar-cycle/annual-solar-cycle.service";
import { DailyCyclesService } from "../perfective/modules/daily-cycles/daily-cycles.service";
import { EclipsesService } from "../perfective/modules/eclipses/eclipses.service";
import { IngressesService } from "../perfective/modules/ingresses/ingresses.service";
import { MonthlyLunarCycleService } from "../perfective/modules/monthly-lunar-cycle/monthly-lunar-cycle.service";
import { PhasesService } from "../perfective/modules/phases/phases.service";
import { RetrogradesService } from "../perfective/modules/retrogrades/retrogrades.service";
import { TwilightsService } from "../perfective/modules/twilights/twilights.service";

import {
  EDGE_EVENTS_FINDERS_TOKEN,
  SPAN_BOUNDARY_RULES,
} from "./progressive.constants";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type {
  EdgeEventsFinder,
  SweepWindow,
} from "../ephemeris/modules/boundary-search/boundary-search.types";
import type { Input } from "../input/input.types";
import type { SpanBoundaryRule } from "./progressive.types";

/**
 * Aggregates progressive event detection from all sub-services.
 *
 * Progressive events (aspects, retrogrades, ingresses, phases, eclipses, etc.)
 * depend on perfective event data produced in the preceding pass. This service
 * fans out to each domain service and merges their results into a single array.
 */
@Injectable()
export class ProgressiveService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EDGE_EVENTS_FINDERS_TOKEN)
    private readonly edgeEventsFinders: EdgeEventsFinder[],
    private readonly annualSolarCycleService: AnnualSolarCycleService,
    private readonly aspectsService: AspectsService,
    private readonly dailyCyclesService: DailyCyclesService,
    private readonly eclipsesService: EclipsesService,
    private readonly ingressesService: IngressesService,
    private readonly monthlyLunarCycleService: MonthlyLunarCycleService,
    private readonly phasesService: PhasesService,
    private readonly retrogradesService: RetrogradesService,
    private readonly twilightsService: TwilightsService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The minutes the spans of a rule start and end on. */
  private collectEdges(
    rule: SpanBoundaryRule,
    spans: readonly DetectedCalendarEvent[],
  ): { ends: Set<number>; starts: Set<number> } {
    const ends = new Set<number>();
    const starts = new Set<number>();
    for (const span of spans) {
      if (!this.isInstant(span) && this.hasAnyTag(span, rule.spans)) {
        starts.add(span.start.valueOf());
        ends.add(span.end.valueOf());
      }
    }

    return { ends, starts };
  }

  /**
   * The perfective events with the boundary events the finders add outside
   * the sweep's window; as they are when there is no window.
   */
  private getEventsWithEdges(
    perfectiveEvents: DetectedCalendarEvent[],
    window?: SweepWindow,
    input?: Input,
  ): DetectedCalendarEvent[] {
    const edgeEvents: DetectedCalendarEvent[] = [];

    if (window !== undefined && input !== undefined) {
      for (const finder of this.edgeEventsFinders) {
        edgeEvents.push(...finder.findEdgeEvents(window, input));
      }
    }

    return withEdgeEvents(perfectiveEvents, edgeEvents);
  }

  /**
   * The first and last minute the perfective sweep covered for an input: whole
   * local days from the start date through the end date.
   */
  private getSweepWindow(input: Input): SweepWindow {
    return {
      end: input.end.clone().tz(input.timezone).endOf("day").startOf("minute"),
      start: input.start.clone().tz(input.timezone).startOf("day"),
    };
  }

  /** Whether the event carries any of the tags. */
  private hasAnyTag(
    event: DetectedCalendarEvent,
    tags: readonly string[],
  ): boolean {
    return tags.some((tag) => event.tags.includes(tag));
  }

  /** Whether the instant is of the rule's family and sits on an edge of one of its spans. */
  private isBoundary(
    instant: DetectedCalendarEvent,
    rule: SpanBoundaryRule,
    edges: { ends: Set<number>; starts: Set<number> },
  ): boolean {
    if (!this.hasAnyTag(instant, rule.instants)) {
      return false;
    }
    const minute = instant.start.valueOf();

    return (
      (rule.edge !== "end" && edges.starts.has(minute)) ||
      (rule.edge !== "start" && edges.ends.has(minute))
    );
  }

  /** Whether the event has no duration. */
  private isInstant(event: DetectedCalendarEvent): boolean {
    return event.start.valueOf() === event.end.valueOf();
  }

  // 🌎 Public Methods

  /**
   * Runs every domain's progressive detection; given the sweep's input,
   * completes the spans its window cuts off, leaving out any clipped to
   * nothing.
   */
  detect(
    perfectiveEvents: DetectedCalendarEvent[],
    input?: Input,
  ): DetectedCalendarEvent[] {
    const window = input === undefined ? undefined : this.getSweepWindow(input);
    const events = this.getEventsWithEdges(perfectiveEvents, window, input);

    const spans = [
      ...this.aspectsService.detectProgressive(perfectiveEvents, window),
      ...this.retrogradesService.detectProgressive(perfectiveEvents, window),
      ...this.dailyCyclesService.detectProgressive(events),
      ...this.eclipsesService.detectProgressive(events),
      ...this.ingressesService.detectProgressive(perfectiveEvents, window),
      ...this.monthlyLunarCycleService.detectProgressive(events),
      ...this.twilightsService.detectProgressive(events),
      ...this.phasesService.detectProgressive(events),
      ...this.annualSolarCycleService.detectProgressive(events),
    ];

    return window === undefined
      ? spans
      : spans.filter((span) => span.end.isAfter(span.start));
  }

  /**
   * The perfective events without instants a span in `spans` starts or ends
   * on; others stay.
   */
  withoutSpanBoundaries(
    perfectiveEvents: readonly DetectedCalendarEvent[],
    spans: readonly DetectedCalendarEvent[],
  ): DetectedCalendarEvent[] {
    const edges = SPAN_BOUNDARY_RULES.map((rule) =>
      this.collectEdges(rule, spans),
    );

    return perfectiveEvents.filter(
      (event) =>
        !this.isInstant(event) ||
        !SPAN_BOUNDARY_RULES.some((rule, index) => {
          const ruleEdges = edges[index];

          return (
            ruleEdges !== undefined && this.isBoundary(event, rule, ruleEdges)
          );
        }),
    );
  }
}
