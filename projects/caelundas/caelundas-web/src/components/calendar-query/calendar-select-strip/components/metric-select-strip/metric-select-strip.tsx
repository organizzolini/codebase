import { useMemo } from "react";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import {
  METRIC_BRANCHES,
  METRIC_CATALOG,
} from "../../../../calendar-display/calendar-metrics/calendar-metrics.constants";
import { getMetricOptions } from "../../../../calendar-display/calendar-metrics/calendar-metrics.utilities";
import { ChipMenu } from "../../../calendar-group-strip/components/chip-menu/chip-menu";
import { moveListItem } from "../../../calendar-group-strip/components/chip-menu/chip-menu.utilities";
import { QueryCascader } from "../../../query-cascader/query-cascader";
import { TagIcon } from "../../../tag-icon/tag-icon";
import { SelectIcon, TITLE } from "../../calendar-select-strip.constants";
import { SelectStripFlow } from "../select-strip-flow/select-strip-flow";

import { isMetricChoice, toMetricList } from "./metric-select-strip.utilities";

import type { EventMetric } from "../../../../../graphql/generated/operations";
import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The metrics shown, and the handler for a new list of them. */
export interface MetricSelectStripProperties {
  className?: string | undefined;
  metrics: readonly EventMetric[];
  onMetricsChange?:
    | ((metrics: readonly EventMetric[] | undefined) => void)
    | undefined;
  /** The layout the metrics are for; the Charts do not offer dates. */
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/** Renders the Select button, opening a searchable list of metrics to measure, with a chip per metric; one always stays. */
export function MetricSelectStrip(
  properties: Readonly<MetricSelectStripProperties>,
): ReactNode {
  const { className, metrics, onMetricsChange, view } = properties;

  // 🪝 Hooks
  const items = useMemo(() => getMetricOptions(view), [view]);

  // 🏗 Setup
  const expanded = METRIC_BRANCHES.map((branch) => branch.value);

  // 💪 Handlers
  const change = (next: readonly EventMetric[]): void => {
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
        chips={metrics.map((metric, index) => ({
          content: (
            <>
              <Button
                className="bg-background dark:bg-input/30"
                size="sm"
                variant="outline"
              >
                <TagIcon name={METRIC_CATALOG[metric].icon} />
                {METRIC_CATALOG[metric].label}
              </Button>
              <ChipMenu
                label={METRIC_CATALOG[metric].label}
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
                onRemove={
                  metrics.length === 1
                    ? undefined
                    : () => {
                        change(metrics.filter((_entry, at) => at !== index));
                      }
                }
              />
            </>
          ),
          id: metric,
        }))}
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
                cascade={false}
                defaultExpanded={expanded}
                items={items}
                mode="tree"
                onValueChange={(next) => {
                  change(toMetricList(next, metrics));
                }}
                placeholder="Select metrics"
                selectable={isMetricChoice}
                value={[...metrics]}
                multiple
              />
            </PopoverContent>
          </Popover>
        }
      />
    </div>
  );
}
