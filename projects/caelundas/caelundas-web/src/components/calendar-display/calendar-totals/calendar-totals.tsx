import { useId } from "react";

import { Button } from "@codebase/presentation";

import { useMetricCatalog } from "../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog";
import { useMetricLayout } from "../../../hooks/use-metric-layout/use-metric-layout";
import { SkeletonCards } from "../calendar-skeleton/skeleton-cards";

import { toTotalsCards } from "./calendar-totals.utilities";
import { TotalsCard } from "./components/totals-card/totals-card";

import type { MetricLayoutProperties } from "../calendar-metrics/calendar-metrics-layout.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the cards read and the toolbar's hooks.
 */
export interface CalendarTotalsProperties extends MetricLayoutProperties {
  className?: string;
}

// 🧩 Component

/**
 * Renders a card for each metric with its total and change against the period before, and the groups it breaks down into.
 */
export function CalendarTotals(
  properties: Readonly<CalendarTotalsProperties>,
): ReactNode {
  const { className, compare, groupColors, timeZone } = properties;

  // 🪝 Hooks
  const { catalog } = useMetricCatalog();
  const layout = useMetricLayout({ ...properties, rootsUntilTouched: true });
  const labelId = useId();

  // 🏗 Setup
  const { data, error, expanded, refetch, status, toggle } = layout;
  const totals = data?.total ?? [];
  const cards = toTotalsCards(totals, catalog.bySlug);
  // Named by the skeleton's own announcement, which it does not repeat.
  const pending =
    data === undefined
      ? ({ "aria-labelledby": labelId, role: "region" } as const)
      : {};

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (status === "error") {
    return (
      <div
        className={className}
        data-testid="calendar-totals"
      >
        <div
          className="flex flex-col items-start gap-2 p-4"
          role="alert"
        >
          <p>{error?.message}</p>
          <Button
            onClick={refetch}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // 🎨 Markup
  return (
    <div
      aria-busy={status === "loading"}
      className={className}
      data-testid="calendar-totals"
      {...pending}
    >
      {data === undefined ? (
        <SkeletonCards labelId={labelId} />
      ) : (
        <section
          aria-label="Totals"
          className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {totals.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              There are no totals to show for these days.
            </p>
          ) : null}
          {cards.map(({ metric, total }) => (
            <TotalsCard
              key={metric.slug}
              compare={compare}
              expanded={expanded}
              groupColors={groupColors}
              groups={data.groups}
              metric={metric}
              onToggle={toggle}
              timeZone={timeZone}
              total={total}
            />
          ))}
        </section>
      )}
    </div>
  );
}
