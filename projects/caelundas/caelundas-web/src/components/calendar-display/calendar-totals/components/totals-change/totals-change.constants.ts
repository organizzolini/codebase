import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

import type { MetricDirection } from "../../../calendar-metrics/calendar-metrics.types";
import type { LucideIcon } from "lucide-react";

// ♟️ Constants

/**
 * The arrow that shows each way a metric moved.
 */
export const DIRECTION_ARROWS: Readonly<Record<MetricDirection, LucideIcon>> = {
  down: ArrowDown,
  flat: ArrowRight,
  up: ArrowUp,
};

/**
 * How each way a metric moved is said to a screen reader.
 */
export const DIRECTION_WORDS: Readonly<Record<MetricDirection, string>> = {
  down: "Down",
  flat: "Unchanged",
  up: "Up",
};
