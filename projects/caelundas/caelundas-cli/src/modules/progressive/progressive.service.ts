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

import { EDGE_EVENTS_FINDERS_TOKEN } from "./progressive.constants";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type {
  EdgeEventsFinder,
  SweepWindow,
} from "../ephemeris/modules/boundary-search/boundary-search.types";
import type { Input } from "../input/input.types";

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

  // 🌎 Public Methods

  /**
   * Runs every domain's progressive detection; given the sweep's input,
   * completes the spans its window cuts off. A span both of whose boundaries
   * lie beyond one limit of the range clips to nothing and is left out.
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
}
