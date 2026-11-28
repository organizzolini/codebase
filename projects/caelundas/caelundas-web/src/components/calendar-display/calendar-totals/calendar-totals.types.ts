import type {
  MetricDescriptor,
  MetricValue,
} from "../calendar-metrics/calendar-metrics.types";

// 🏷️ Types

/**
 * A card's metric and its total.
 */
export interface TotalsCardEntry {
  metric: MetricDescriptor;
  total: MetricValue;
}
