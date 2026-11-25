import {
  formatMetricChange,
  formatMetricValue,
} from "../../../calendar-metrics/calendar-metrics.utilities";
import { formatMetricValueCompact } from "../../../calendar-metrics/components/calendar-metrics-compact/calendar-metrics-compact.utilities";

import { DIRECTION_ARROWS, DIRECTION_WORDS } from "./totals-change.constants";

import type { EventMetric } from "../../../../../graphql/generated/operations";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A metric's value, the previous period's, and whether to show it.
 */
export interface TotalsChangeProperties {
  className?: string;
  metric: EventMetric;
  previous: null | number;
  showPrevious?: boolean;
  timeZone?: string | undefined;
  value: null | number;
}

// 🧩 Component

/**
 * Renders how a metric moved against the previous period: an arrow, the signed percent, and the previous value; nothing without one.
 */
export function TotalsChange(
  properties: Readonly<TotalsChangeProperties>,
): ReactNode {
  const {
    className = "",
    metric,
    previous,
    showPrevious = false,
    timeZone,
    value,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const change = formatMetricChange(metric, value, previous);
  const Arrow = DIRECTION_ARROWS[change.direction];
  const text = change.percentText === "" ? change.text : change.percentText;
  const full = formatMetricValue(metric, previous, timeZone);
  const brief = formatMetricValueCompact(metric, previous, timeZone);
  const abbreviated = brief !== full;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (previous === null) {
    return null;
  }

  // 🎨 Markup
  return (
    <span
      className={`text-muted-foreground inline-flex items-center gap-1 text-xs tabular-nums ${className}`}
      data-direction={change.direction}
      data-testid="totals-change"
    >
      <Arrow
        aria-hidden="true"
        className="size-3"
      />
      <span className="sr-only">{DIRECTION_WORDS[change.direction]} </span>
      {text}
      {showPrevious ? (
        <span
          className="opacity-70"
          title={full}
        >
          <span aria-hidden={abbreviated}>vs {brief}</span>
          {abbreviated ? <span className="sr-only">vs {full}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
