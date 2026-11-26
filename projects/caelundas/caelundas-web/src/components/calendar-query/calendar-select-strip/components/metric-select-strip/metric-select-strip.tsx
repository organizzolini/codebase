import { useMemo } from "react";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { useMetricCatalog } from "../../../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog";
import { METRIC_BRANCHES } from "../../../../calendar-display/calendar-metrics/calendar-metrics.constants";
import { getMetricOptions } from "../../../../calendar-display/calendar-metrics/calendar-metrics.utilities";
import { ChipMenu } from "../../../calendar-group-strip/components/chip-menu/chip-menu";
import { moveListItem } from "../../../calendar-group-strip/components/chip-menu/chip-menu.utilities";
import { QueryCascader } from "../../../query-cascader/query-cascader";
import { TagIcon } from "../../../tag-icon/tag-icon";
import { SelectIcon, TITLE } from "../../calendar-select-strip.constants";
import { SelectStripFlow } from "../select-strip-flow/select-strip-flow";

import { toMetricList, toMetricValue } from "./metric-select-strip.utilities";

import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { StripFold } from "../../../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The metrics shown, and the handler for a new list of them. */
export interface MetricSelectStripProperties {
  className?: string | undefined;
  /** How the strip folds; it does not when absent. */
  fold?: StripFold | undefined;
  metrics: readonly string[];
  onMetricsChange?:
    | ((metrics: readonly string[] | undefined) => void)
    | undefined;
  /** The layout the metrics are for; the Charts do not offer dates. */
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/** Renders the Select button, opening a searchable list of metrics to measure, with a chip per metric; one always stays. */
export function MetricSelectStrip(
  properties: Readonly<MetricSelectStripProperties>,
): ReactNode {
  const { className, fold, metrics, onMetricsChange, view } = properties;

  // 🪝 Hooks
  const { catalog } = useMetricCatalog();
  const items = useMemo(() => getMetricOptions(catalog, view), [catalog, view]);

  // 🏗 Setup
  const expanded = METRIC_BRANCHES.map((branch) => branch.value);

  // 💪 Handlers
  const change = (next: readonly string[]): void => {
    onMetricsChange?.(next);
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="metric-select-strip"
    >
      <SelectStripFlow
        chips={metrics.flatMap((metric, index) => {
          const descriptor = catalog.bySlug.get(metric);

          // Until the catalog is read, no metric has a name to show.
          return descriptor === undefined
            ? []
            : [
                {
                  content: (
                    <>
                      <Button
                        className="bg-background dark:bg-input/30"
                        size="sm"
                        variant="outline"
                      >
                        <TagIcon name={descriptor.icon} />
                        {descriptor.name}
                      </Button>
                      <ChipMenu
                        label={descriptor.name}
                        onMoveLeft={
                          index === 0
                            ? undefined
                            : () => {
                                change(moveListItem(metrics, index, -1));
                              }
                        }
                        onMoveRight={
                          index === metrics.length - 1
                            ? undefined
                            : () => {
                                change(moveListItem(metrics, index, 1));
                              }
                        }
                        onOnly={
                          metrics.length === 1
                            ? undefined
                            : () => {
                                change([metric]);
                              }
                        }
                        onRemove={
                          metrics.length === 1
                            ? undefined
                            : () => {
                                change(
                                  metrics.filter((_entry, at) => at !== index),
                                );
                              }
                        }
                      />
                    </>
                  ),
                  id: metric,
                  name: descriptor.name,
                },
              ];
        })}
        fold={fold}
        label={TITLE}
        trigger={
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                >
                  <SelectIcon aria-hidden="true" />
                  {TITLE}
                </Button>
              }
            />
            <PopoverContent
              align="start"
              aria-label="Select metrics"
              className="w-80 max-w-[90vw] p-0"
            >
              <QueryCascader
                defaultExpanded={expanded}
                items={items}
                mode="tree"
                onValueChange={(next) => {
                  change(toMetricList(next, metrics));
                }}
                placeholder="Select metrics"
                value={toMetricValue(metrics, items)}
                multiple
              />
            </PopoverContent>
          </Popover>
        }
      />
    </div>
  );
}
