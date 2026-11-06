import { describe, expect, it } from "vitest";

import { serveCalendarApi } from "../../../testing/calendar-api";
import { EMPTY_EVENT_FILTER } from "../calendar-filters/event-filter-tree.constants";

import { loadCalendar } from "./calendar-loader.utilities";

// The collection the API resolved against the fixture's tags, as it answers:
// the events that stand still.
const HIGHLIGHTS = {
  description: "The events most worth a look.",
  filter: {
    combinator: "AND" as const,
    groups: null,
    rules: [
      {
        negated: false,
        operator: "is_any_of",
        path: ["tag:tag-type"],
        values: ["tag-retrograde"],
      },
    ],
  },
  id: "highlights",
  name: "Highlights",
};
const MARCH = { date: "2026-03-15", view: "month" } as const;

describe(loadCalendar, () => {
  it("opens on the default collection when the link names no filter", async () => {
    serveCalendarApi({ collections: [HIGHLIGHTS], defaultId: "highlights" });

    const data = await loadCalendar(MARCH);

    expect(data.filtered).toBe(true);
    expect(data.filter?.rules).toHaveLength(1);
    expect(data.events.map((event) => event.id)).toStrictEqual([
      "event-mercury-retrograde",
    ]);
    expect(data.collections.map((collection) => collection.id)).toStrictEqual([
      "highlights",
    ]);
  });

  it("offers the collections without opening on one the API has none default", async () => {
    serveCalendarApi({ collections: [HIGHLIGHTS] });

    const data = await loadCalendar(MARCH);

    expect(data.collections).toHaveLength(1);
    expect(data.filter).toBeUndefined();
    expect(data.filtered).toBe(false);
  });

  it("shows every event when the link holds an empty filter", async () => {
    const api = serveCalendarApi();
    const data = await loadCalendar({ ...MARCH, filter: EMPTY_EVENT_FILTER });

    expect(data.filtered).toBe(false);
    expect(data.events.length).toBeGreaterThan(1);
    expect(api.requests.events[0]?.filter).toBeNull();
  });

  it("reads the events with the filter the link holds, as the API's input", async () => {
    const api = serveCalendarApi();
    const data = await loadCalendar({
      ...MARCH,
      filter: {
        combinator: "and",
        id: "group",
        rules: [
          {
            id: "rule",
            operator: "is_any_of",
            path: ["tag:tag-planet"],
            type: "rule",
            value: ["tag-venus"],
          },
        ],
        type: "group",
      },
    });

    expect(data.filtered).toBe(true);
    expect(api.requests.events[0]?.filter).toStrictEqual({
      combinator: "AND",
      rules: [
        {
          operator: "is_any_of",
          path: ["tag:tag-planet"],
          values: ["tag-venus"],
        },
      ],
    });
    expect(data.events.map((event) => event.id)).toStrictEqual([
      "event-mars-conjunct-venus",
      "event-venus-ingress-aries",
    ]);
  });

  it("reads the events' instants as dates and the dataset's span", async () => {
    serveCalendarApi();

    const data = await loadCalendar({ ...MARCH, filter: EMPTY_EVENT_FILTER });

    expect(data.events[0]?.start).toBeInstanceOf(Date);
    expect(data.dataset).toStrictEqual({
      count: 6,
      end: new Date("2026-06-21T08:24:00.000Z"),
      start: new Date("2026-02-26T06:48:00.000Z"),
      timezone: "America/New_York",
    });
  });

  it("reports no dataset for an API that holds no events", async () => {
    serveCalendarApi({ events: [] });

    const data = await loadCalendar({ ...MARCH, filter: EMPTY_EVENT_FILTER });

    expect(data.dataset).toBeNull();
    expect(data.emptiness).toStrictEqual({ kind: "database" });
  });

  it("applies no filter when the data has none of the default's tags", async () => {
    const api = serveCalendarApi();

    const data = await loadCalendar(MARCH);

    expect(data.filter).toBeUndefined();
    expect(data.filtered).toBe(false);
    expect(api.requests.filterCollections).toBe(1);
  });

  it("counts each tag's events only in the days the view shows", async () => {
    const api = serveCalendarApi();
    const countOf = (data: Awaited<ReturnType<typeof loadCalendar>>): number =>
      data.facets
        .flatMap((facet) => facet.values)
        .find((value) => value.id === "tag-conjunct")?.count ?? -1;
    // Mars conjunct Venus is on 4 March, so a day on either side of it holds
    // it and a week in April does not.
    const march = await loadCalendar({ date: "2026-03-04", view: "day" });
    const april = await loadCalendar({ date: "2026-04-20", view: "week" });

    expect(countOf(march)).toBe(1);
    expect(countOf(april)).toBe(0);
    expect(api.requests.facets).toHaveLength(2);
  });

  it("reads the counts again for each window, once", async () => {
    const api = serveCalendarApi();

    await loadCalendar({ date: "2026-03-04", view: "day" });
    await loadCalendar({ date: "2026-03-04", view: "day" });
    await loadCalendar({ date: "2026-03-05", view: "day" });

    expect(api.requests.facets).toHaveLength(2);
  });

  it("forgets a read that failed, so a retry asks the API again", async () => {
    const api = serveCalendarApi();

    api.fail("The API answered 500");

    await expect(loadCalendar(MARCH)).rejects.toThrow("The API answered 500");

    api.recover();

    await expect(loadCalendar(MARCH)).resolves.toMatchObject({
      dataset: { count: 6 },
    });
  });
});
