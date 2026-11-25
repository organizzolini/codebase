import { useState } from "react";

import {
  findGroupColor,
  findGroupValue,
  getShownGroups,
} from "../../calendar-totals.utilities";
import { TotalsSubtotal } from "../totals-subtotal/totals-subtotal";

import { TotalsMoreCard } from "./totals-more-card";
import { TotalsSumsTo } from "./totals-sums-to";

import type { EventMetric } from "../../../../../graphql/generated/operations";
import type { MetricGroup } from "../../../calendar-metrics/calendar-metrics.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Groups listed as cards, their open ancestors, and how they read.
 */
export interface TotalsGroupListProperties {
  /**
   * The open groups above the list, outermost first.
   */
  ancestors: readonly MetricGroup[];
  compare: boolean;
  /**
   * The ids of the groups that are open, shared with the table and the charts.
   */
  expanded: ReadonlySet<string>;
  groupColors?: ReadonlyMap<string, string> | undefined;
  /**
   * How many cards to list before offering the rest in a more card.
   */
  groupLimit: number;
  groups: readonly MetricGroup[];
  metric: EventMetric;
  onToggle: (id: string) => void;
  timeZone?: string | undefined;
  /**
   * The value the listed groups make up: their parent's, or the metric's total.
   */
  whole: null | number;
}

// 🧩 Component

/**
 * Renders groups as cards that open into their subgroups' cards, a more card, and what they sum to.
 */
export function TotalsGroupList(
  properties: Readonly<TotalsGroupListProperties>,
): ReactNode {
  const {
    ancestors,
    compare,
    expanded,
    groupColors,
    groupLimit,
    groups,
    metric,
    onToggle,
    timeZone,
    whole,
  } = properties;

  // 🪝 Hooks
  const [showAll, setShowAll] = useState(false);

  // 🏗 Setup
  const cards: ReactNode[] = [];

  // A loop rather than a map keeps the call stack shallow.
  for (const group of getShownGroups(groups, showAll, groupLimit)) {
    const children = group.children ?? [];
    const open = children.length > 0 && expanded.has(group.id);
    const node = { ancestors, group, isExpandable: children.length > 0 };

    cards.push(
      <li
        key={group.id}
        className={open ? "@sm:col-span-2" : undefined}
      >
        <TotalsSubtotal
          color={findGroupColor(node, groupColors)}
          compare={compare}
          metric={metric}
          node={node}
          onToggle={onToggle}
          open={open}
          timeZone={timeZone}
          whole={whole}
        >
          {open ? (
            <div className="border-border ml-1.5 border-l-2 pl-2">
              <TotalsGroupList
                {...properties}
                ancestors={[...ancestors, group]}
                groups={children}
                whole={findGroupValue(group, metric)}
              />
            </div>
          ) : null}
        </TotalsSubtotal>
      </li>,
    );
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (groups.length === 0) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className="@container flex flex-col gap-1.5"
      data-testid="totals-group-list"
    >
      <TotalsSumsTo
        metric={metric}
        timeZone={timeZone}
        whole={whole}
      />
      <ul className="grid grid-cols-1 gap-2 @sm:grid-cols-2">
        {cards}
        <TotalsMoreCard
          count={groups.length - groupLimit}
          isShowingAll={showAll}
          onToggle={() => {
            setShowAll((current) => !current);
          }}
        />
      </ul>
    </div>
  );
}
