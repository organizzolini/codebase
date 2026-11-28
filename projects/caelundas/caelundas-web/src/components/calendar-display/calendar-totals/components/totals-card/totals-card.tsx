import { TagIcon } from "../../../../calendar-query/tag-icon/tag-icon";
import { formatMetricValue } from "../../../calendar-metrics/calendar-metrics.utilities";
import { FULL_PERCENT } from "../../calendar-totals.constants";
import { getSharePercent } from "../../calendar-totals.utilities";
import { TotalsChange } from "../totals-change/totals-change";
import { TotalsGroupList } from "../totals-group-list/totals-group-list";

import type {
  MetricDescriptor,
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
  groups: readonly MetricGroup[];
  metric: MetricDescriptor;
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
    groups,
    metric,
    onToggle,
    timeZone,
    total,
  } = properties;
  const { previous, value } = total;

  // 🪝 Hooks

  // 🏗 Setup
  const meter =
    metric.unit === "NONE" ? getSharePercent(value, FULL_PERCENT) : null;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <article
      aria-label={metric.name}
      className="bg-card flex flex-col gap-3 rounded-lg border p-4"
      data-metric={metric.slug}
      data-testid="totals-card"
    >
      <header
        className="text-muted-foreground flex items-center gap-2 text-sm"
        title={metric.note}
      >
        <TagIcon name={metric.icon} />
        <h3 className="font-medium">{metric.name}</h3>
      </header>
      <p
        className="text-3xl font-semibold tabular-nums"
        data-testid="totals-value"
      >
        {formatMetricValue(metric, value, timeZone)}
      </p>
      <p className="text-muted-foreground -mt-2 text-xs">{metric.note}</p>
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
          aria-label={metric.name}
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
        groups={groups}
        metric={metric}
        onToggle={onToggle}
        timeZone={timeZone}
        whole={value}
      />
    </article>
  );
}
