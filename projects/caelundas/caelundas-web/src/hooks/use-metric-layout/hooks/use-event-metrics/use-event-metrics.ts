import { useEffect, useState } from "react";

import { getDayRange } from "../../../../components/calendar-display/calendar-table/calendar-table.utilities";
import { AGENDA_DAY_COUNT } from "../../../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { formatCalendarDate } from "../../../../components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities";
import { findEventMetrics } from "../../../../components/calendar-display/events-calendar/components/events-api/events-api.utilities";
import { toEventFilterInput } from "../../../../components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities";
import { toEventGroupingInput } from "../../../../components/calendar-query/calendar-group-strip/components/event-group-model/event-group-input.utilities";

import { METRICS_CACHE, NOTHING_SETTLED } from "./use-event-metrics.constants";
import {
  forgetEventMetrics,
  parseMetricsKey,
  rememberEventMetrics,
  toError,
  toZonedMidnight,
} from "./use-event-metrics.utilities";

import type { EventMetricsData } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { EventMetricsInput } from "../../../../graphql/generated/operations";
import type {
  SettledMetrics,
  UseEventMetricsOptions,
  UseEventMetricsResult,
} from "./use-event-metrics.types";

// 🧩 Hook

/**
 * Reads the events' metrics for the table's days under the filter, grouped by every level, keeping the last answer while loading.
 */
export function useEventMetrics(
  options: Readonly<UseEventMetricsOptions>,
): UseEventMetricsResult {
  // 🪝 Hooks
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<EventMetricsData | undefined>();
  const [settled, setSettled] = useState<SettledMetrics>(NOTHING_SETTLED);

  // 🏗 Setup
  const { agendaDays, anchor, compare, filter, grouping, metrics, timeZone } =
    options;
  // The API's input as text: it keys the cache and the effect that reads.
  const range = getDayRange(
    formatCalendarDate(anchor, timeZone),
    timeZone,
    agendaDays ?? AGENDA_DAY_COUNT,
  );
  const input: EventMetricsInput = {
    compareToPrevious: compare,
    filter: toEventFilterInput(filter),
    grouping: toEventGroupingInput(grouping)?.levels ?? null,
    metrics: [...metrics],
    period: {
      end: toZonedMidnight(range.through, timeZone).toISOString(),
      start: toZonedMidnight(range.from, timeZone).toISOString(),
    },
  };
  const key = JSON.stringify(input);
  const readKey = `${key}#${String(attempt)}`;

  // 💪 Handlers
  const refetch = (): void => {
    forgetEventMetrics(key);
    setAttempt((count) => count + 1);
  };

  // ♻️ Lifecycle
  useEffect(() => {
    let isCurrent = true;

    const read =
      METRICS_CACHE.get(key) ?? findEventMetrics(parseMetricsKey(key));

    rememberEventMetrics(key, read);
    read.then(
      (loaded) => {
        if (isCurrent) {
          setData(loaded);
          setSettled({ error: undefined, key: readKey, status: "ready" });
        }
      },
      (error: unknown) => {
        if (isCurrent) {
          setSettled({ error: toError(error), key: readKey, status: "error" });
        }
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [key, readKey]);

  // 🎁 Result
  return {
    data,
    error: settled.key === readKey ? settled.error : undefined,
    refetch,
    status: settled.key === readKey ? settled.status : "loading",
  };
}
