// 🏷️ Types
import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { Input } from "../../../input/input.types";
import type { Moment } from "moment-timezone";

/** The two neighboring minutes a state change falls between. */
export interface BoundaryBracket {
  /** The nearest minute the state still holds at. */
  inside: Moment;
  /** The nearest minute the state no longer holds at. */
  outside: Moment;
}

/** What a boundary search walks away from, and how far. */
export interface BoundarySearchArguments {
  /** 1 searches forward in time, -1 backward. */
  direction: -1 | 1;
  /** A minute the state holds at, where the walk begins. */
  from: Moment;
  /** Whether the state holds at a minute. */
  isInside: (minute: Moment) => boolean;
  /** The last minute the walk may probe. */
  limit: Moment;
  /** Width the bracket narrows to, in minutes; one when omitted. */
  resolutionMinutes?: number;
  /** Minutes between one probe and the next. */
  stepMinutes: number;
}

/** A state of the sky whose changes the family detects as events. */
export interface EdgeEventsArguments {
  /** The family's own detector, run on the ephemeris around a minute. */
  detectAt: (minute: Moment) => DetectedCalendarEvent[];
  /** Whether a detected event is the boundary being sought. */
  isBoundary?: (event: DetectedCalendarEvent) => boolean;
  /** The state a minute is in; a boundary is where it changes. */
  stateAt: (minute: Moment) => boolean | number | string;
  /** Minutes between one probe and the next. */
  stepMinutes: number;
  /** The sweep the boundaries lie beyond. */
  window: SweepWindow;
}

/** A family that finds the boundary events just outside a sweep. */
export interface EdgeEventsFinder {
  /**
   * The boundary events the sweep's window cut off, at their true minute, for
   * the progressive pass to pair with the ones it detected.
   */
  findEdgeEvents(window: SweepWindow, input: Input): DetectedCalendarEvent[];
}

/** The first and last minute a perfective sweep covered. */
export interface SweepWindow {
  /** The last minute swept. */
  end: Moment;
  /** The first minute swept. */
  start: Moment;
}
