import { useEffect, useMemo, useState } from "react";

import { toError } from "../../../../../hooks/use-metric-layout/hooks/use-event-metrics/use-event-metrics.utilities";

import {
  EMPTY_CATALOG,
  MetricCatalogContext,
} from "./metric-catalog-provider.constants";
import {
  forgetMetricCatalog,
  readMetricCatalog,
  toCatalogStatus,
} from "./metric-catalog-provider.utilities";

import type { SettledCatalog } from "./metric-catalog-provider.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The tree it serves, and a class for its element.
 */
export interface MetricCatalogProviderProperties {
  children?: ReactNode;
  className?: string;
}

// 🧩 Component

/**
 * Reads the API's metric catalog once and passes it, its status and a retry to every component beneath, so none threads them through.
 */
export function MetricCatalogProvider(
  properties: Readonly<MetricCatalogProviderProperties>,
): ReactNode {
  const { children, className } = properties;

  // 🪝 Hooks
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<SettledCatalog>({
    catalog: undefined,
    error: undefined,
  });

  // 🏗 Setup
  const { catalog, error } = settled;
  const status = toCatalogStatus(settled);
  const value = useMemo(
    () => ({
      catalog: catalog ?? EMPTY_CATALOG,
      error,
      retry: () => {
        forgetMetricCatalog();
        setSettled({ catalog: undefined, error: undefined });
        setAttempt((count) => count + 1);
      },
      status,
    }),
    [catalog, error, status],
  );

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    let isCurrent = true;

    readMetricCatalog().then(
      (read) => {
        if (isCurrent) {
          setSettled({ catalog: read, error: undefined });
        }
      },
      (error_: unknown) => {
        if (isCurrent) {
          setSettled({ catalog: undefined, error: toError(error_) });
        }
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="metric-catalog-provider"
    >
      <MetricCatalogContext value={value}>{children}</MetricCatalogContext>
    </div>
  );
}
