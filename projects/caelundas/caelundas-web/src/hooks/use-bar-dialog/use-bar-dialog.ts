import { createElement, useState } from "react";

import { CalendarClusterDialog } from "../../components/calendar-cluster-dialog";

import { describeBar } from "./use-bar-dialog.utilities";

import type { OpenedBar, UseBarDialogResult } from "./use-bar-dialog.types";

// 🧩 Hook

/**
 * Holds the marker clicked and the dialog that lists its events: the handler
 * to give the Gantt, and the dialog to draw.
 */
export function useBarDialog(timeZone: string): UseBarDialogResult {
  // 🪝 Hooks
  const [opened, setOpened] = useState<OpenedBar>();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    dialog: createElement(CalendarClusterDialog, {
      members: opened?.records,
      onClose: () => {
        setOpened(undefined);
      },
      timeZone,
      title: opened?.title ?? "",
    }),
    handleEventClick: (occurrence) => {
      setOpened(describeBar(occurrence.event.data));
    },
  };
}
