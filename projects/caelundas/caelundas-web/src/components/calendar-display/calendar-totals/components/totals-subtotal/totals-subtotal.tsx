import { ChevronDown, ChevronRight } from "lucide-react";

import { TagLead } from "../../../../calendar-events/tag-lead/tag-lead";
import { formatMetricValue } from "../../../calendar-metrics/calendar-metrics.utilities";
import { formatMetricValueCompact } from "../../../calendar-metrics/components/calendar-metrics-compact/calendar-metrics-compact.utilities";
import { TotalsChange } from "../totals-change/totals-change";

import { TotalsShareBar } from "./totals-share-bar";
import { NEUTRAL_COLOR } from "./totals-subtotal.constants";
import { readRowFigures } from "./totals-subtotal.utilities";

import type { EventMetric } from "../../../../../graphql/generated/operations";
import type { MetricNode } from "../../../calendar-metrics/calendar-metrics.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A group, its metric and whole, how it opens, and children.
 */
export interface TotalsSubtotalProperties {
  /**
   * The cards of the group's subgroups, shown when it is open.
   */
  children?: ReactNode;
  color?: string | undefined;
  compare: boolean;
  metric: EventMetric;
  node: MetricNode;
  onToggle: (id: string) => void;
  open: boolean;
  timeZone?: string | undefined;
  whole: null | number;
}

// 🧩 Component

/**
 * Renders a group as a nested card: swatch, name, compact value, share and change; a button when it has subgroups.
 */
export function TotalsSubtotal(
  properties: Readonly<TotalsSubtotalProperties>,
): ReactNode {
  const {
    children,
    color,
    compare,
    metric,
    node,
    onToggle,
    open,
    timeZone,
    whole,
  } = properties;
  const { group, isExpandable } = node;

  // 🪝 Hooks

  // 🏗 Setup
  const { previous, share, value } = readRowFigures(group, metric, whole);
  const full = formatMetricValue(metric, value, timeZone);
  const brief = formatMetricValueCompact(metric, value, timeZone);
  const abbreviated = brief !== full;
  const Chevron = open ? ChevronDown : ChevronRight;
  const fill = color ?? NEUTRAL_COLOR;
  const label = (
    <>
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full"
        data-testid="totals-swatch"
        style={{ background: fill }}
      />
      <TagLead
        icon={undefined}
        id={group.key ?? undefined}
        label={group.label}
      />
      <span className="truncate">{group.label}</span>
    </>
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className="bg-background/60 flex flex-col gap-1.5 rounded-md border p-2"
      data-testid="totals-subtotal"
    >
      <div className="flex items-center gap-2 text-sm">
        {isExpandable ? (
          <button
            aria-expanded={open}
            className="hover:bg-muted flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-sm text-left"
            onClick={() => {
              onToggle(group.id);
            }}
            type="button"
          >
            <Chevron
              aria-hidden="true"
              className="size-3.5 shrink-0"
            />
            {label}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3.5 shrink-0"
            />
            {label}
          </div>
        )}
        <span
          className="shrink-0 font-medium tabular-nums"
          title={full}
        >
          <span aria-hidden={abbreviated}>{brief}</span>
          {abbreviated ? <span className="sr-only">{full}</span> : null}
        </span>
      </div>
      {compare ? (
        <TotalsChange
          className="pl-5.5"
          metric={metric}
          previous={previous}
          timeZone={timeZone}
          value={value}
        />
      ) : null}
      <TotalsShareBar
        color={fill}
        share={share}
      />
      {children}
    </div>
  );
}
