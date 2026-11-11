import { HttpResponse } from "msw";

import { DURATION_BUCKETS } from "../src/components/calendar-filters/event-filters.constants";
import {
  calendarViewSchema,
  timelineScaleSchema,
} from "../src/components/events-calendar/calendar-views.constants";
import { getViewWindows } from "../src/components/events-calendar/calendar-window.utilities";
import {
  mockDatasetQuery,
  mockEventsQuery,
  mockFacetsQuery,
  mockNightSkyQuery,
  mockPresetsQuery,
  mockWindowsQuery,
} from "../src/graphql/generated/mocks";

import { FIXTURE_EVENTS, FIXTURE_TAGS } from "./calendar-fixture";
import { serveGraphqlApi } from "./graphql-api";

import type {
  EventFilterGroupInput,
  EventFilterRuleInput,
  EventGroupLevelInput,
  EventsQuery,
  EventsQueryVariables,
  FacetsQuery,
  FacetsQueryVariables,
  NightSkyInput,
  NightSkyQuery,
  PresetsQuery,
  WindowsQueryVariables,
} from "../src/graphql/generated/operations";
import type { FixtureEvent, FixtureTag } from "./calendar-fixture";

/**
 * A test's mock API, its requests, and a failure switch.
 */
export interface CalendarApi {
  /**
   * Makes every read fail with the message, until `recover`.
   */
  fail: (message: string) => void;
  recover: () => void;
  requests: {
    events: EventsQueryVariables[];
    facets: FacetsQueryVariables[];
    nightSky: NightSkyInput[];
    presets: number;
    windows: WindowsQueryVariables[];
  };
}

/**
 * What a test may change about the API it serves.
 */
export interface CalendarApiOptions {
  defaultId?: string;
  /**
   * How long every events read after the first takes, as a slow connection
   * would.
   */
  delay?: number;
  events?: readonly FixtureEvent[];
  /**
   * Answers no read at all, like an API that is never reached.
   */
  hang?: boolean;
  /**
   * Builds the sky for each request; a bare SVG the size asked for by
   * default.
   */
  nightSky?: (input: NightSkyInput) => NightSkyQuery["nightSky"];
  /**
   * Fails only the sky's reads with this message, the calendar's reads
   * answering as usual.
   */
  nightSkyError?: string;
  /**
   * The presets the API offers, the one with the `defaultId` the
   * preset the calendar opens on; none by default.
   */
  presets?: readonly Preset[];
  tags?: readonly FixtureTag[];
}

/**
 * One filter preset as the API answers it.
 */
type Preset = PresetsQuery["presets"][number];

/**
 * The tag tree's lookups: each tag's ancestors, depth, root and full path.
 */
interface Tree {
  ancestors: (id: string) => readonly string[];
  byId: ReadonlyMap<string, FixtureTag>;
  depth: (id: string) => number;
  path: (id: string) => string;
  root: (id: string) => string;
}

let served: CalendarApi | undefined;

/**
 * The API the test serves last, which a route test reads what was asked of
 * after it renders.
 */
export function readServedApi(): CalendarApi {
  if (served === undefined) {
    throw new Error("No test has served the calendar API");
  }

  return served;
}

/**
 * Serves the calendar API over fixture data, or the options given.
 */
export function serveCalendarApi(
  options: CalendarApiOptions = {},
): CalendarApi {
  const events = options.events ?? FIXTURE_EVENTS;
  const tree = createTree(options.tags ?? FIXTURE_TAGS);
  const roots = [...tree.byId.values()].filter((tag) => tag.parentId === null);
  const api: CalendarApi = {
    fail: (message) => {
      failure = message;
    },
    recover: () => {
      failure = undefined;
    },
    requests: {
      events: [],
      facets: [],
      nightSky: [],
      presets: 0,
      windows: [],
    },
  };
  let failure: string | undefined;
  const answer = async (data: () => unknown): Promise<Response> => {
    if (options.hang === true) {
      await new Promise(() => {});
    }

    return failure === undefined
      ? HttpResponse.json({ data: data() })
      : HttpResponse.json({ errors: [{ message: failure }] });
  };

  serveGraphqlApi(
    mockDatasetQuery(async () =>
      answer(() => ({ dataset: summarize(events) })),
    ),
    mockEventsQuery(async ({ variables }) => {
      api.requests.events.push(variables);

      if (api.requests.events.length > 1 && (options.delay ?? 0) > 0) {
        await new Promise((resolve) => {
          setTimeout(resolve, options.delay);
        });
      }

      return answer(() => ({
        events: findEvents(events, tree, variables),
      }));
    }),
    mockFacetsQuery(async ({ variables }) => {
      api.requests.facets.push(variables);

      return answer(() => ({
        facets: findFacets(events, tree, roots, variables),
      }));
    }),
    mockPresetsQuery(async () => {
      api.requests.presets += 1;

      return answer(() => ({
        defaultPreset:
          options.presets?.find(({ id }) => id === options.defaultId) ?? null,
        presets: [...(options.presets ?? [])],
      }));
    }),
    mockWindowsQuery(async ({ variables }) => {
      api.requests.windows.push(variables);

      return answer(() => ({ windows: findWindows(variables) }));
    }),
    mockNightSkyQuery(async ({ variables }) => {
      api.requests.nightSky.push(variables.input);

      if (options.nightSkyError !== undefined) {
        return HttpResponse.json({
          errors: [{ message: options.nightSkyError }],
        });
      }

      return answer(() => ({
        nightSky: (options.nightSky ?? drawBareSky)(variables.input),
      }));
    }),
  );
  served = api;

  return api;
}

/**
 * The tree's lookups: each tag's ancestors, depth, root and full path.
 */
function createTree(tags: readonly FixtureTag[]): Tree {
  const byId = new Map(tags.map((tag) => [tag.id, tag]));
  const ancestors = (id: string): readonly string[] => {
    const parent = byId.get(id)?.parentId ?? null;

    return parent === null ? [] : [parent, ...ancestors(parent)];
  };

  return {
    ancestors,
    byId,
    depth: (id) => ancestors(id).length,
    path: (id) =>
      [...ancestors(id).toReversed(), id]
        .map((part) => byId.get(part)?.name ?? part)
        .join(" / "),
    root: (id) => ancestors(id).at(-1) ?? id,
  };
}

/**
 * A bare sky the size asked for, with the measurements of an unclamped one.
 */
function drawBareSky(input: NightSkyInput): NightSkyQuery["nightSky"] {
  const svg = `<svg data-latitude="${String(input.latitudeDegrees ?? 90)}" data-still="${String(input.still ?? false)}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(input.width)} ${String(input.height)}"><rect fill="#000" height="${String(input.height)}" width="${String(input.width)}"/></svg>`;

  return {
    measurements: {
      bottomAltitudeDegrees: input.bottomAltitudeDegrees ?? 0,
      fieldOfViewClamped: false,
      fieldOfViewLimitDegrees: 89,
      periodSeconds: 600,
      poleDistanceAboveScreen: 0,
      realTimeMultiple: 1,
      segmentsDrawn: 0,
      starsDrawn: 0,
      starsInCatalog: 0,
      svgLength: svg.length,
      topAltitudeDegrees: 90,
      verticalFieldOfViewDegrees: input.verticalFieldOfViewDegrees ?? 90,
    },
    svg,
  };
}

/**
 * The events that overlap the period and meet the filter, earliest first,
 * with their tags and the keys of every grouping level.
 */
function findEvents(
  events: readonly FixtureEvent[],
  tree: Tree,
  variables: EventsQueryVariables,
): EventsQuery["events"] {
  const levels = [
    ...(variables.grouping?.levels ?? []),
    ...(variables.grouping?.colorBy === null ||
    variables.grouping?.colorBy === undefined
      ? []
      : [variables.grouping.colorBy]),
  ];

  return events
    .filter(
      (event) =>
        overlaps(event, variables.period) &&
        matches(event, tree, variables.filter),
    )
    .toSorted(
      (left, right) =>
        left.start.localeCompare(right.start) ||
        left.summary.localeCompare(right.summary),
    )
    .map((event) => {
      const minutes = Math.round(
        (new Date(event.end).getTime() - new Date(event.start).getTime()) /
          60_000,
      );

      return {
        color: event.color,
        description: event.description,
        durationMinutes: minutes,
        end: event.end,
        groups: levels.map((level) => findGroupKeys(event, tree, level)),
        id: event.id,
        location: event.location,
        start: event.start,
        startLocalDay: readLocalDay(event),
        startLocalHour: Number(readLocalHour(event)),
        summary: event.summary,
        tags: event.tagIds
          .map((id) => ({
            depth: tree.depth(id),
            id,
            name: tree.byId.get(id)?.name ?? id,
            path: tree.path(id),
          }))
          .toSorted((left, right) => left.path.localeCompare(right.path)),
        timezone: event.timezone,
      };
    });
}

/**
 * The tags every root offers beneath it, counted over the events of the
 * period that meet the filter.
 */
function findFacets(
  events: readonly FixtureEvent[],
  tree: Tree,
  roots: readonly FixtureTag[],
  variables: FacetsQueryVariables,
): FacetsQuery["facets"] {
  const counted = events.filter(
    (event) =>
      overlaps(event, variables.period) &&
      matches(event, tree, variables.filter),
  );

  return roots
    .toSorted((left, right) => left.name.localeCompare(right.name))
    .map((root) => ({
      id: root.id,
      name: root.name,
      values: [...tree.byId.values()]
        .filter((tag) => tag.parentId !== null && tree.root(tag.id) === root.id)
        .toSorted((left, right) =>
          tree.path(left.id).localeCompare(tree.path(right.id)),
        )
        .map((tag) => ({
          count: counted.filter((event) =>
            listEventTags(event, tree).has(tag.id),
          ).length,
          depth: tree.depth(tag.id),
          id: tag.id,
          name: tag.name,
          path: tree.path(tag.id).slice(root.name.length + " / ".length),
        })),
    }));
}

/**
 * The groups an event falls in at one level of a grouping.
 */
function findGroupKeys(
  event: FixtureEvent,
  tree: Tree,
  level: EventGroupLevelInput,
): { key: string; label: null | string; path: null | string }[] {
  if (!level.field.startsWith("tag:")) {
    return [
      { key: readDerivedKey(event, level.field), label: null, path: null },
    ];
  }

  const rootId = level.field.slice("tag:".length);
  const carried = [...listEventTags(event, tree)].filter(
    (id) => tree.root(id) === rootId && tree.depth(id) > 0,
  );
  const depth = level.depth ?? 1;
  const picked =
    level.tags === null || level.tags === undefined || level.tags.length === 0
      ? undefined
      : level.tags;
  const keys = carried.filter((id) =>
    picked === undefined
      ? tree.depth(id) === depth ||
        (tree.depth(id) < depth &&
          !carried.some((other) => tree.ancestors(other).includes(id)))
      : picked.includes(id),
  );

  return keys.map((id) => ({
    key: id,
    label: tree.byId.get(id)?.name ?? id,
    path: tree.path(id),
  }));
}

/**
 * The days a view shows and the period read for them, from the web's own
 * calendar arithmetic, which the real API reproduces.
 */
function findWindows(variables: WindowsQueryVariables): {
  columnMinutes: null | number;
  read: { end: string; start: string };
  visible: { end: string; start: string };
} {
  const { read, visible } = getViewWindows(
    variables.window === null || variables.window === undefined
      ? undefined
      : calendarViewSchema.parse(
          variables.window.toLowerCase().replace("_", "-"),
        ),
    new Date(variables.anchor),
    {
      agendaDays: variables.agendaDays ?? undefined,
      scale:
        variables.scale === null || variables.scale === undefined
          ? undefined
          : timelineScaleSchema.parse(variables.scale.toLowerCase()),
    },
  );

  return {
    columnMinutes: null,
    read: {
      end: read.end.toISOString(),
      start: read.start.toISOString(),
    },
    visible: {
      end: visible.end.toISOString(),
      start: visible.start.toISOString(),
    },
  };
}

/**
 * Every tag an event carries, the ones it was given and all above them.
 */
function listEventTags(event: FixtureEvent, tree: Tree): Set<string> {
  const tags = new Set<string>();

  for (const id of event.tagIds) {
    tags.add(id);

    for (const ancestor of tree.ancestors(id)) {
      tags.add(ancestor);
    }
  }

  return tags;
}

/**
 * Whether an event meets a filter's tag and text rules; other fields keep every event.
 */
function matches(
  event: FixtureEvent,
  tree: Tree,
  group: EventFilterGroupInput | null | undefined,
): boolean {
  if (group === null || group === undefined) {
    return true;
  }

  const results = [
    ...(group.rules ?? []).map((rule) => matchesRule(event, tree, rule)),
    ...(group.groups ?? []).map((child) => matches(event, tree, child)),
  ];

  return group.combinator === "OR"
    ? results.length === 0 || results.includes(true)
    : !results.includes(false);
}

/**
 * Whether an event meets one rule.
 */
function matchesRule(
  event: FixtureEvent,
  tree: Tree,
  rule: EventFilterRuleInput,
): boolean {
  const values = rule.values ?? [];
  const [field = ""] = rule.path;
  let held = true;

  if (field.startsWith("tag:")) {
    const tags = listEventTags(event, tree);

    switch (rule.operator) {
      case "has_all_of": {
        held = values.every((value) => tags.has(value));

        break;
      }
      case "is_any_of": {
        held = values.some((value) => tags.has(value));

        break;
      }
      case "is_none_of": {
        held = !values.some((value) => tags.has(value));

        break;
      }
      // No default
    }
  } else if (field === "date" && values.length === 2) {
    const [from = "", to = ""] = values;
    const overlapsRange =
      readLocalDay({ ...event, start: event.end }) >= from &&
      readLocalDay(event) <= to;

    held = rule.operator === "not_between" ? !overlapsRange : overlapsRange;
  } else if (field === "text") {
    const needle = (values[0] ?? "").toLowerCase();
    const found = `${event.summary} ${event.description}`
      .toLowerCase()
      .includes(needle);

    held = rule.operator === "not_contains" ? !found : found;
  }

  return rule.negated === true ? !held : held;
}

/**
 * Whether an event overlaps a half-open period.
 */
function overlaps(
  event: FixtureEvent,
  period: null | undefined | { end: string; start: string },
): boolean {
  return (
    period === null ||
    period === undefined ||
    (new Date(event.start) < new Date(period.end) &&
      new Date(event.end) >= new Date(period.start))
  );
}

/**
 * The key of a derived field for an event, read in the zone it was observed
 * in; keys sort in time order as text.
 */
function readDerivedKey(event: FixtureEvent, field: string): string {
  const day = readLocalDay(event);
  const minutes = Math.round(
    (new Date(event.end).getTime() - new Date(event.start).getTime()) / 60_000,
  );
  const date = new Date(`${day}T00:00:00Z`);

  switch (field) {
    case "day": {
      return day;
    }
    case "duration": {
      return (
        DURATION_BUCKETS.find(
          (bucket) => minutes >= bucket.minimum && minutes <= bucket.maximum,
        )?.value ?? ""
      );
    }
    case "hour": {
      return readLocalHour(event);
    }
    case "month": {
      return day.slice(0, 7);
    }
    case "quarter": {
      return `${day.slice(0, 4)}-Q${String(Math.ceil(Number(day.slice(5, 7)) / 3))}`;
    }
    case "week": {
      date.setUTCDate(date.getUTCDate() - date.getUTCDay());

      return date.toISOString().slice(0, 10);
    }
    case "weekday": {
      return String(date.getUTCDay());
    }
    default: {
      return day.slice(0, 4);
    }
  }
}

/**
 * The calendar day an event starts on in its own zone, as `YYYY-MM-DD`.
 */
function readLocalDay(event: FixtureEvent): string {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: event.timezone,
    year: "numeric",
  }).format(new Date(event.start));
}

/**
 * The hour an event starts in in its own zone, two digits.
 */
function readLocalHour(event: FixtureEvent): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: event.timezone,
  }).format(new Date(event.start));
}

/**
 * The span and zone of the events, or nothing for none.
 */
function summarize(
  events: readonly FixtureEvent[],
): null | { count: number; end: string; start: string; timezone: string } {
  const first = events[0];

  if (first === undefined) {
    return null;
  }

  return {
    count: events.length,
    end:
      events
        .map(({ end }) => end)
        .toSorted()
        .at(-1) ?? first.end,
    start: events.map(({ start }) => start).toSorted()[0] ?? first.start,
    timezone: first.timezone,
  };
}
