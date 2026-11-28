import { createMock } from "@golevelup/ts-vitest";
import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";

import { EclipsesEdgesService } from "./eclipses-edges.service";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { EphemerisService } from "../../../ephemeris/ephemeris.service";
import type { Input } from "../../../input/input.types";
import type { EclipsesService } from "./eclipses.service";
import type { EclipseCalculationService } from "./modules/calculation/eclipse-calculation.service";
import type { EclipseGeometryService } from "./modules/geometry/eclipse-geometry.service";

const first = moment.utc("1900-01-01T00:00:00Z");
const last = moment.utc("2100-12-31T23:59:00Z");

const contact = (iso: string, phase: string): DetectedCalendarEvent => ({
  description: phase,
  end: moment.utc(iso),
  start: moment.utc(iso),
  summary: phase,
  tags: ["Eclipse", phase],
});

/**
 * Builds the service over an eclipse underway at every minute, whose contacts
 * `contacts` names.
 */
function buildService(contacts: DetectedCalendarEvent[]): EclipsesEdgesService {
  const ephemeris = createMock<EphemerisService>();
  ephemeris.computeAllEphemerides.mockReturnValue(
    createMock<ReturnType<EphemerisService["computeAllEphemerides"]>>(),
  );
  const calculation = createMock<EclipseCalculationService>();
  const geometry = createMock<EclipseGeometryService>();
  geometry.getLunarContactGeometry.mockReturnValue(
    createMock({ contactLimit: 2, separation: 1 }),
  );
  geometry.getSolarContactGeometry.mockReturnValue(
    createMock({ contactLimit: 2, separation: 1 }),
  );
  const eclipses = createMock<EclipsesService>();
  eclipses.detect.mockImplementation(({ minute }) =>
    contacts.filter((event) => event.start.isSame(minute)),
  );

  return new EclipsesEdgesService(
    new BoundarySearchService(),
    calculation,
    geometry,
    eclipses,
    ephemeris,
    new LoggerService(),
  );
}

describe(EclipsesEdgesService, () => {
  const input = createMock<Input>({ latitude: 0, longitude: 0 });

  it("clips a contact before the range's first minute to it", () => {
    const service = buildService([
      contact("1899-12-31T21:00:00Z", "Beginning"),
    ]);

    const events = service.findEdgeEvents(
      { end: first.clone().add(20, "hours"), start: first },
      input,
    );

    expect(
      events.map((event) => [event.description, event.start.toISOString()]),
    ).toStrictEqual([["Beginning", "1900-01-01T00:00:00.000Z"]]);
    expect(events[0]?.end.toISOString()).toBe("1900-01-01T00:00:00.000Z");
  });

  it("clips a contact after the range's last minute to it", () => {
    const service = buildService([
      contact("2100-12-30T20:00:00Z", "Beginning"),
      contact("2101-01-01T03:00:00Z", "Ending"),
    ]);

    const events = service.findEdgeEvents(
      { end: last, start: last.clone().subtract(20, "hours") },
      input,
    );

    expect(
      events.map((event) => [event.description, event.start.toISOString()]),
    ).toStrictEqual([
      ["Beginning", "2100-12-30T20:00:00.000Z"],
      ["Ending", "2100-12-31T23:59:00.000Z"],
    ]);
  });

  it("leaves a contact inside the range as it is", () => {
    const service = buildService([
      contact("2026-03-03T08:44:00Z", "Beginning"),
    ]);
    const window = {
      end: moment.utc("2026-03-03T11:00:00Z"),
      start: moment.utc("2026-03-03T10:30:00Z"),
    };

    expect([
      ...new Set(
        service
          .findEdgeEvents(window, input)
          .map((event) => event.start.toISOString()),
      ),
    ]).toStrictEqual(["2026-03-03T08:44:00.000Z"]);
  });
});
