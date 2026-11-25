import { TagIcon } from "../../../../calendar-query/tag-icon/tag-icon";
import { METRIC_CATALOG } from "../../../calendar-metrics/calendar-metrics.constants";
import { formatMetricValue } from "../../../calendar-metrics/calendar-metrics.utilities";
import { FULL_PERCENT } from "../../calendar-totals.constants";
import { getSharePercent } from "../../calendar-totals.utilities";
import { TotalsChange } from "../totals-change/totals-change";
import { TotalsGroupList } from "../totals-group-list/totals-group-list";

import type {
  MetricGroup,
  MetricValue,
} from "../../../calendar-metrics/calendar-metrics.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A metric's total, its groups, which are open, and how they read.
 */
export interface TotalsCardProperties {
  compare: boolean;
  /**
   * The ids of the groups that are open, shared with the table and the charts.
   */
  expanded: ReadonlySet<string>;
  groupColors?: ReadonlyMap<string, string> | undefined;
  /**
   * How many groups to list before offering the rest in a more card.
   */
  groupLimit: number;
  groups: readonly MetricGroup[];
  onToggle: (id: string) => void;
  timeZone?: string | undefined;
  total: MetricValue;
}

// 🧩 Component

/**
 * Renders a metric's total, change and meter, holding a nested card per group's subtotal.
 */
export function TotalsCard(
  properties: Readonly<TotalsCardProperties>,
): ReactNode {
  const {
    compare,
    expanded,
    groupColors,
    groupLimit,
    groups,
    onToggle,
    timeZone,
    total,
  } = properties;
  const { metric, previous, value } = total;

  // 🪝 Hooks

  // 🏗 Setup
  const descriptor = METRIC_CATALOG[metric];
  const meter =
    descriptor.format === "percent"
      ? getSharePercent(value, FULL_PERCENT)
      : null;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <article
      aria-label={descriptor.label}
      className="bg-card flex flex-col gap-3 rounded-lg border p-4"
      data-metric={metric}
      data-testid="totals-card"
    >
      <header
        className="text-muted-foreground flex items-center gap-2 text-sm"
        title={descriptor.description}
      >
        <TagIcon name={descriptor.icon} />
        <h3 className="font-medium">{descriptor.label}</h3>
      </header>
      <p
        className="text-3xl font-semibold tabular-nums"
        data-testid="totals-value"
      >
        {formatMetricValue(metric, value, timeZone)}
      </p>
      <p className="text-muted-foreground -mt-2 text-xs">
        {descriptor.description}
      </p>
      {compare ? (
        <TotalsChange
          metric={metric}
          previous={previous}
          timeZone={timeZone}
          value={value}
          showPrevious
        />
      ) : null}
      {meter === null ? null : (
        <div
          aria-label={descriptor.label}
          aria-valuemax={FULL_PERCENT}
          aria-valuemin={0}
          aria-valuenow={meter}
          className="bg-muted h-1 overflow-hidden rounded-full"
          data-testid="totals-meter"
          role="meter"
        >
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${String(meter)}%` }}
          />
        </div>
      )}
      <TotalsGroupList
        ancestors={[]}
        compare={compare}
        expanded={expanded}
        groupColors={groupColors}
        groupLimit={groupLimit}
        groups={groups}
        metric={metric}
        onToggle={onToggle}
        timeZone={timeZone}
        whole={value}
      />
    </article>
  );
}
