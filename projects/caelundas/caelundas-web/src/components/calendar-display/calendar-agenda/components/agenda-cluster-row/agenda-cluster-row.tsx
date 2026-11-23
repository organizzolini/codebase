import { ChevronDown, ChevronRight } from "lucide-react";

import { formatEventCount } from "../../calendar-agenda.utilities";

import type { AgendaRow } from "../../calendar-agenda.types";
import type { ReactNode } from "react";

// 🔖 Type

/** A cluster to draw and its open-close handler. */
export interface AgendaClusterRowProperties {
  className?: string;
  onToggle?: ((id: string) => void) | undefined;
  row: Extract<AgendaRow, { kind: "cluster" }>;
}

// 🧩 Component

/**
 * Renders a cluster of similar events as a button that opens or closes it.
 */
export function AgendaClusterRow(
  properties: Readonly<AgendaClusterRowProperties>,
): ReactNode {
  const { className, onToggle, row } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const Chevron = row.expanded ? ChevronDown : ChevronRight;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <button
      aria-expanded={row.expanded}
      className={`hover:bg-muted/50 flex h-full w-full items-center gap-2 border-b px-4 text-left text-sm ${className ?? ""}`}
      data-testid="agenda-cluster-row"
      onClick={() => {
        onToggle?.(row.id);
      }}
      type="button"
    >
      <Chevron
        aria-hidden="true"
        className="size-4 shrink-0"
      />
      <span className="truncate font-medium">{row.label}</span>
      <span className="text-muted-foreground shrink-0 text-xs">
        {formatEventCount(row.count)}
      </span>
    </button>
  );
}
