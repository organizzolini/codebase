import fs from "node:fs";
import path from "node:path";

import { expect } from "vitest";

import {
  MILLISECONDS_PER_MINUTE,
  REFERENCE_FIXTURES_DIRECTORY,
  referenceFixtureSchema,
} from "./reference-fixtures.constants";

import type { DetectedCalendarEvent } from "../src/modules/calendar-events/calendar-events.types";
import type {
  ReferenceComparison,
  ReferenceEvent,
  ReferenceFixture,
} from "./reference-fixtures.types";

/**
 * Fails the test unless every reference event pairs with a detected event within tolerance and every `absent` and `counts` check holds.
 */
export function assertReferenceEvents(
  events: readonly DetectedCalendarEvent[],
  fixture: ReferenceFixture,
): void {
  const failures = compareReferenceEvents(events, fixture)
    .filter((comparison) => !comparison.passed)
    .map((comparison) => describeFailure(comparison));
  const unexpected = (fixture.absent ?? []).flatMap((summary) =>
    events
      .filter((event) => isNamed(event, summary))
      .map(
        (event) =>
          `${summary}: must not be detected, found at ${event.start.toISOString()}`,
      ),
  );
  const miscounted = Object.entries(fixture.counts ?? {}).flatMap(
    ([summary, count]) => {
      const found = events.filter((event) => isNamed(event, summary));

      return found.length === count
        ? []
        : [
            `${summary}: expected exactly ${count} ${count === 1 ? "event" : "events"}, found ${found.length}${found.length > 0 ? ` (at ${found.map((event) => event.start.toISOString()).join(", ")})` : ""}`,
          ];
    },
  );
  const problems = [...failures, ...unexpected, ...miscounted];
  if (problems.length > 0) {
    expect.fail(
      [
        `${problems.length} of ${fixture.events.length + (fixture.absent?.length ?? 0) + Object.keys(fixture.counts ?? {}).length} reference checks failed for "${fixture.name}" (${fixture.source.name}, retrieved ${fixture.retrieved}):`,
        ...problems,
      ].join("\n"),
    );
  }

  // Counts as an assertion on the passing path, so `expect.hasAssertions()` holds.
  expect(problems).toHaveLength(0);
}

/**
 * Pairs each reference with the nearest-start detected event of its summary, and checks start and end within tolerance.
 */
export function compareReferenceEvents(
  events: readonly DetectedCalendarEvent[],
  fixture: ReferenceFixture,
): ReferenceComparison[] {
  const paired = pairEvents(events, fixture.events);

  return fixture.events.map((expected, index) => {
    const toleranceMinutes =
      expected.toleranceMinutes ?? fixture.toleranceMinutes;
    const actual = paired[index];
    if (!actual) {
      return { expected, passed: false, toleranceMinutes };
    }

    const startDeltaMinutes = minutesBetween(
      expected.start,
      actual.start.toDate(),
    );
    const endDeltaMinutes =
      expected.end === undefined
        ? undefined
        : minutesBetween(expected.end, actual.end.toDate());
    const passed =
      Math.abs(startDeltaMinutes) <= toleranceMinutes &&
      (endDeltaMinutes === undefined ||
        Math.abs(endDeltaMinutes) <= toleranceMinutes);

    return {
      actual,
      ...(endDeltaMinutes === undefined ? {} : { endDeltaMinutes }),
      expected,
      passed,
      startDeltaMinutes,
      toleranceMinutes,
    };
  });
}

/**
 * Reads and validates `<name>.json` from the fixtures directory; a fixture without source, retrieval date or tolerance is rejected.
 */
export function loadReferenceFixture(
  name: string,
  directory: string = REFERENCE_FIXTURES_DIRECTORY,
): ReferenceFixture {
  const contents = fs.readFileSync(
    path.join(directory, `${name}.json`),
    "utf8",
  );

  return referenceFixtureSchema.parse(JSON.parse(contents));
}

/** Renders one failed comparison as the lines a failing test prints. */
function describeFailure(comparison: ReferenceComparison): string {
  const { actual, endDeltaMinutes, expected, startDeltaMinutes } = comparison;
  const label = `${expected.summary}: expected ${formatInstant(expected.start)}`;
  if (!actual || startDeltaMinutes === undefined) {
    return `${label}, none detected`;
  }

  const tolerance = `(tolerance ±${comparison.toleranceMinutes} min)`;
  const parts = [
    `${label}, actual ${actual.start.toISOString()}, delta ${formatDelta(startDeltaMinutes)} min ${tolerance}`,
  ];
  if (expected.end !== undefined && endDeltaMinutes !== undefined) {
    parts.push(
      `  end expected ${formatInstant(expected.end)}, actual ${actual.end.toISOString()}, delta ${formatDelta(endDeltaMinutes)} min ${tolerance}`,
    );
  }

  return parts.join("\n");
}

/** Formats a signed number of minutes with one decimal, such as `+1.5`. */
function formatDelta(minutes: number): string {
  return `${minutes >= 0 ? "+" : "-"}${Math.abs(minutes).toFixed(1)}`;
}

/** Normalises a fixture instant to the ISO form detected events print in. */
function formatInstant(instant: string): string {
  return new Date(instant).toISOString();
}

/**
 * Whether `name` is the event's title or description; a fixture tells a perfective event apart by its description.
 */
function isNamed(event: DetectedCalendarEvent, name: string): boolean {
  return event.summary === name || event.description === name;
}

/** Minutes from `reference` to `actual`: positive when the detected moment is later. */
function minutesBetween(reference: string, actual: Date): number {
  return (actual.getTime() - Date.parse(reference)) / MILLISECONDS_PER_MINUTE;
}

/**
 * Pairs each reference with a detected event of its summary, nearest start and end first, so each event satisfies one reference.
 */
function pairEvents(
  events: readonly DetectedCalendarEvent[],
  references: readonly ReferenceEvent[],
): (DetectedCalendarEvent | undefined)[] {
  const candidates = references
    .flatMap((reference, referenceIndex) =>
      events
        .filter((event) => event.summary === reference.summary)
        .map((event) => ({
          distance:
            Math.abs(event.start.valueOf() - Date.parse(reference.start)) +
            Math.abs(
              event.end.valueOf() -
                (reference.end === undefined
                  ? event.start.valueOf()
                  : Date.parse(reference.end)),
            ),
          event,
          referenceIndex,
        })),
    )
    .toSorted((a, b) => a.distance - b.distance);
  const paired: (DetectedCalendarEvent | undefined)[] = references.map(
    () => undefined,
  );
  const claimed = new Set<DetectedCalendarEvent>();
  for (const { event, referenceIndex } of candidates) {
    if (paired[referenceIndex] === undefined && !claimed.has(event)) {
      paired[referenceIndex] = event;
      claimed.add(event);
    }
  }

  return paired;
}
