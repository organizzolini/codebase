import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@codebase/presentation";

import { AGENDA_ROW_HEIGHTS } from "../lib/calendar/calendar-agenda";

import { CalendarEventRow } from "./calendar-event-row";
import { VirtualList } from "./virtual-list";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The cluster to open, the events it stands for, and what to do on close.
 */
export interface CalendarClusterDialogProperties {
  className?: string;
  /**
   * The events behind the cluster; the dialog is closed without them.
   */
  members: readonly CalendarEventRecord[] | undefined;
  onClose: () => void;
  timeZone: string;
  /**
   * What the cluster is called: its count and kind.
   */
  title: string;
}

// 🧩 Component

/**
 * Renders the events a cluster stands for, in order of start, as a list that
 * draws only the rows on screen.
 */
export function CalendarClusterDialog(
  properties: Readonly<CalendarClusterDialogProperties>,
): ReactNode {
  const { className, members, onClose, timeZone, title } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const renderRow = (record: CalendarEventRecord): ReactNode => (
    <CalendarEventRow
      className="h-full"
      record={record}
      timeZone={timeZone}
    />
  );

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-cluster-dialog"
    >
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        open={members !== undefined}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              The events that run together here, in order of start.
            </DialogDescription>
          </DialogHeader>
          <VirtualList
            className="h-96 max-h-[60dvh]"
            getRowHeight={getEventRowHeight}
            getRowKey={getEventRowKey}
            label={title}
            renderRow={renderRow}
            rows={members ?? []}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Every row of the list is one event's.
 */
function getEventRowHeight(): number {
  return AGENDA_ROW_HEIGHTS.event;
}

/**
 * Names a row by its event.
 */
function getEventRowKey(record: CalendarEventRecord): string {
  return record.id;
}
