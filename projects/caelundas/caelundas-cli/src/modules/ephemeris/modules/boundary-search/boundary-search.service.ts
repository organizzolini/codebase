import { Injectable } from "@nestjs/common";
import moment from "moment-timezone";

import { maximumDate, minimumDate } from "../../../input/input.constants";

import {
  BOUNDARY_PROBE_OFFSETS_MINUTES,
  LIMIT_EXTENSION_DAYS,
  MILLISECONDS_PER_MINUTE,
} from "./boundary-search.constants";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type {
  BoundaryBracket,
  BoundarySearchArguments,
  EdgeEventsArguments,
  SweepWindow,
} from "./boundary-search.types";
import type { Moment } from "moment-timezone";

/**
 * Finds where a state of the sky starts or stops holding, one probe step at a
 * time, then narrows the step that held the change down to the minute.
 */
@Injectable()
export class BoundarySearchService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Runs the family's detector on the minutes around a bracket, outside first,
   * until one names the boundary.
   */
  private detectBoundary(
    args: EdgeEventsArguments,
    bracket: BoundaryBracket,
  ): DetectedCalendarEvent | undefined {
    const { detectAt, isBoundary = () => true } = args;

    for (const base of [bracket.outside, bracket.inside]) {
      for (const offset of BOUNDARY_PROBE_OFFSETS_MINUTES) {
        const event = detectAt(base.clone().add(offset, "minutes")).find(
          (candidate) => isBoundary(candidate),
        );
        if (event !== undefined) {
          return event;
        }
      }
    }

    return undefined;
  }

  /**
   * Halves the gap between a minute inside the state and one outside it until
   * it is no wider than the resolution.
   */
  private narrow(
    args: BoundarySearchArguments,
    bracket: { inside: number; outside: number },
  ): BoundaryBracket {
    const { isInside, resolutionMinutes = 1 } = args;
    const resolution = resolutionMinutes * MILLISECONDS_PER_MINUTE;
    let { inside, outside } = bracket;

    while (Math.abs(outside - inside) > resolution) {
      const half = Math.trunc((outside - inside) / 2 / MILLISECONDS_PER_MINUTE);
      const middle = inside + half * MILLISECONDS_PER_MINUTE;
      if (isInside(moment.utc(middle))) {
        inside = middle;
      } else {
        outside = middle;
      }
    }

    return { inside: moment.utc(inside), outside: moment.utc(outside) };
  }

  // 🌎 Public Methods

  /**
   * An event with its start and end pulled back to the range's limits, so a
   * span whose true boundary lies past one is clipped there.
   */
  clip(
    event: DetectedCalendarEvent,
    window: SweepWindow,
  ): DetectedCalendarEvent {
    const first = this.getLimit(-1, window.start);
    const last = this.getLimit(1, window.end);
    const bound = (minute: Moment): Moment =>
      moment.min(moment.max(minute, first), last);
    const start = bound(event.start);
    const end = bound(event.end);

    return start.isSame(event.start) && end.isSame(event.end)
      ? event
      : { ...event, end, start };
  }

  // A state that stops and resumes inside one probe step goes unseen, so the
  // step must be shorter than the shortest absence.
  /**
   * Walks from a minute the state holds at until it stops, and returns the
   * minutes the change falls between; undefined at the limit.
   */
  find(args: BoundarySearchArguments): BoundaryBracket | undefined {
    const { direction, from, isInside, limit, stepMinutes } = args;
    const step = direction * stepMinutes * MILLISECONDS_PER_MINUTE;
    const end = limit.valueOf();
    let inside = from.valueOf();

    while (direction * (end - inside) > 0) {
      const probe =
        direction === 1
          ? Math.min(inside + step, end)
          : Math.max(inside + step, end);
      if (!isInside(moment.utc(probe))) {
        return this.narrow(args, { inside, outside: probe });
      }
      inside = probe;
    }

    return undefined;
  }

  /**
   * Like find, but where the range ends first it walks on past the limit, so a
   * boundary the limit cuts off is still found; undefined when none lies
   * within the extension.
   */
  findBeyondLimit(
    args: Omit<BoundarySearchArguments, "limit">,
  ): BoundaryBracket | undefined {
    const { direction, from } = args;

    return this.find({
      ...args,
      limit: this.getLimit(direction, from)
        .clone()
        .add(direction * LIMIT_EXTENSION_DAYS, "days"),
    });
  }

  /**
   * The boundary events just outside a sweep: where its first minute's state
   * began and where its last minute's ends. At the range's limit the search
   * walks on past it to name the boundary, which then clips to the limit.
   */
  findEdgeEvents(args: EdgeEventsArguments): DetectedCalendarEvent[] {
    const { stateAt, stepMinutes, window } = args;
    const searches = [
      { direction: -1, from: window.start },
      { direction: 1, from: window.end },
    ] as const;

    return searches.flatMap(({ direction, from }) => {
      const state = stateAt(from);
      const bracket = this.findBeyondLimit({
        direction,
        from,
        isInside: (minute: Moment) => stateAt(minute) === state,
        stepMinutes,
      });
      const event =
        bracket === undefined ? undefined : this.detectBoundary(args, bracket);

      return event === undefined ? [] : [this.clip(event, window)];
    });
  }

  /**
   * The range's first or last minute, where a span is clipped; a window
   * reaching past it keeps its own edge, so a span never ends short of what
   * was swept.
   */
  getLimit(direction: -1 | 1, edge: Moment): Moment {
    return direction === 1
      ? moment.max(
          moment.utc(maximumDate).endOf("day").startOf("minute"),
          moment.utc(edge),
        )
      : moment.min(moment.utc(minimumDate), moment.utc(edge));
  }
}
